/* global describe, beforeEach, jasmine, module, inject, it, xit, expect */

describe('scenario', function () {
  var mockHttpBackend, mockWindow, scenarioMockDataProvider, scenarioMockData,
    scenarioMocks, scenarioName, scenario1, scenario2, queueScenario, scenarios,
    httpRespondFunction;

  beforeEach(function () {
    scenario1 = [
      [{
        'uri': 'http://example.com/test',
        'httpMethod': 'GET',
        'statusCode': 200,
        'response': {
          'scenario': 1
        }
      }]
    ];

    scenario2 = [
      [{
        'uri': 'http://example.com/test',
        'httpMethod': 'GET',
        'statusCode': 200,
        'response': {
          'scenario': 1
        }
      }]
    ];

    queueScenario = [
      [
        {
          'uri': 'http://example.com/test',
          'httpMethod': 'GET',
          'statusCode': 204,
          'response': {
            'scenario': 'poll'
          }
        },
        {
          'uri': 'http://example.com/test',
          'httpMethod': 'GET',
          'statusCode': 200,
          'response': {
            'scenario': 'poll'
          }
        }
      ]
    ];

    scenarios = {
      scenario1: scenario1,
      scenario2: scenario2
    };

    mockHttpBackend = jasmine.createSpyObj('$httpBackend', [
      'when',
      'respond'
    ]);
    mockHttpBackend.when.andReturn(mockHttpBackend);
    mockHttpBackend.respond.andCallFake(function respondFunction(fn) {
      httpRespondFunction = fn;
    });

    mockWindow = {location: {search: ''}};
  });

  describe('scenarioName', function () {
    beforeEach(function () {
      module('scenario');
      inject(function (_scenarioName_) {
        scenarioName = _scenarioName_;
      });
    });

    it('should extract the scenario name from string similar to that ' +
       'available in window.location.search', function () {
      expect(scenarioName.extract('?scenario=foo')).toBe('foo');
    });

    it('should return undefined if no scenario name is available in the ' +
       'input string', function () {
      expect(scenarioName.extract('')).toBe(undefined);
      expect(scenarioName.extract('?other=stuff')).toBe(undefined);
    });
  });

  describe('scenarioMockDataProvider', function () {
    beforeEach(function () {
      module(
        'scenario',
        function ($provide, _scenarioMockDataProvider_) {
          $provide.value('$httpBackend', mockHttpBackend);
          scenarioMockDataProvider = _scenarioMockDataProvider_;
        }
      );

      inject(function (_scenarioMockData_, _scenarioMocks_) {
        scenarioMockData = _scenarioMockData_;
        scenarioMocks = _scenarioMocks_;
      });
    });

    it('should allow a client app to set mock data', function () {
      // act
      scenarioMockDataProvider.setMockData(scenarios);

      // assert
      expect(scenarioMockData.getMockData()).toEqual(scenarios);
    });

    it('should allow a client app to incrementally add mock data', function () {
      // act
      scenarioMockDataProvider.addMockData('scenario1', scenario1);
      scenarioMockDataProvider.addMockData('scenario2', scenario2);

      // assert
      expect(scenarioMockData.getMockData()).toEqual(scenarios);
    });

    it('should load the default scenario if specified', function () {
      // arrange
      scenarioMockDataProvider.addMockData('_default', scenario2);

      // act
      scenarioMocks.setup();

      // assert
      var mockResource = scenario2[0][0];
      expect(mockHttpBackend.when).toHaveBeenCalledWith(
        mockResource.httpMethod, mockResource.uri, mockResource.requestData);
      expect(mockHttpBackend.respond).toHaveBeenCalledWith(
        jasmine.any(Function));
    });

    it('should allow a client app to set the default scenario', function () {
      // arrange
      var defaultScenario = 'foo';

      // act
      scenarioMockDataProvider.setDefaultScenario(defaultScenario);

      // assert
      expect(scenarioMockData.getDefaultScenario()).toEqual(defaultScenario);
    });
  });

  describe('scenarioMocks', function () {
    var setupScenarioMocks = function (mockData) {
      mockWindow = {location: {search: '?scenario=scenario2'}};
      module(
        'scenario',
        function ($provide, _scenarioMockDataProvider_) {
          $provide.value('$httpBackend', mockHttpBackend);
          $provide.value('$window', mockWindow);
          scenarioMockDataProvider = _scenarioMockDataProvider_;
          scenarioMockDataProvider.setMockData(mockData);
        }
      );
      inject();
    };

    it('should load the scenario specified on the query string', function () {
      // arrange
      setupScenarioMocks(scenarios);

      // assert
      var mockResource = scenario2[0][0];
      expect(mockHttpBackend.when).toHaveBeenCalledWith(
        mockResource.httpMethod, mockResource.uri, mockResource.requestData);
      expect(mockHttpBackend.respond).toHaveBeenCalledWith(
        jasmine.any(Function));
    });

    it('should do nothing if the specified scenario isn\'t found', function () {
      // arrange - inject empty mock data
      setupScenarioMocks({});

      // assert
      expect(mockHttpBackend.when).not.toHaveBeenCalled();
      expect(mockHttpBackend.respond).not.toHaveBeenCalled();
    });


    it('should register a function to generate responses for mocks with ' +
       'queues', function () {
      // arrange
      setupScenarioMocks({'scenario2': queueScenario});

      // assert
      var mockResource = queueScenario[0][0];
      expect(mockHttpBackend.when).toHaveBeenCalledWith(
        mockResource.httpMethod, mockResource.uri, mockResource.requestData);
      expect(mockHttpBackend.respond)
        .toHaveBeenCalledWith(jasmine.any(Function));

      var r1 = httpRespondFunction();
      var r2 = httpRespondFunction();
      expect(r1[0]).toBe(queueScenario[0][0].statusCode);
      expect(r2[0]).toBe(queueScenario[0][1].statusCode);
    });
  });
});
