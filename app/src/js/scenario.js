/* global angular, _, console */

angular
  .module('scenario', ['ui.router'])

  .provider('scenarioMockData', function () {
    var mockData = {},
      defaultScenario = '_default';

    this.setMockData = function (data) {
      mockData = data;
    };

    this.addMockData = function (name, data) {
      mockData[name] = data;
    };

    this.setDefaultScenario = function (scenario) {
      defaultScenario = scenario;
    };

    this.$get = function $get() {
      return {
        getMockData: function () {
          return mockData;
        },
        getDefaultScenario: function () {
          return defaultScenario;
        }
      };
    };
  })

  .factory('scenarioMocks', [
    '$q',
    '$http',
    '$httpBackend',
    'scenarioMockData',
    function ($q, $http, $httpBackend, scenarioMockData) {

      var setupHttpBackendForMockResource = function (mock) {

        var mockHeaders = {
          'Content-Type': 'application/vnd.wonga.rest+json; charset=utf-8'
        };

        var responseCount = 0;
        $httpBackend
          .when(mock[0].httpMethod, mock[0].uri, mock[0].requestData)
          .respond(function () {
            var callIndex = Math.min(responseCount, mock.length - 1);
            responseCount++;
            return [
              mock[callIndex].statusCode,
              mock[callIndex].response,
              _.merge(mockHeaders, mock[callIndex].headers)
            ];
          })
        ;
      };

      return {
        setup: function (scenarioName) {
          var mockData = scenarioMockData.getMockData();
          var actualScenarioName =
                scenarioName || scenarioMockData.getDefaultScenario();

          if (_.has(mockData, actualScenarioName)) {
            var scenario = mockData[actualScenarioName];

            // Set mock for each item.
            _.forOwn(scenario, function (mock) {
              setupHttpBackendForMockResource(mock);
            });
          }
          else if (scenarioName) {
            // only write to console if scenario actively specified
            console.log('Mocks not found for: ' + scenarioName);
          }
        }
      };
    }
  ])

  .config([
    '$stateProvider',
    function ($stateProvider) {
      $stateProvider.state('scenario', {
        url: '/scenario/:state/:mock',
        controller: 'scenarioController'
      });
    }
  ])

  .controller('scenarioController', [
    '$state',
    '$stateParams',
    'scenarioMocks',
    function ($state, $stateParams, scenarioMocks) {
      if (!_.isUndefined($stateParams.mock)) {
        scenarioMocks.setup($stateParams.mock).then(function () {
          if (!_.isUndefined($stateParams.state)) {
            $state.transitionTo($stateParams.state);
          }
        });
      }
    }
  ])

  .factory('scenarioName', function () {
    return {
      extract: function (search) {
        if (search.indexOf('scenario') !== -1) {
          var scenarioParams = search
            .slice(1)
            .split('&')
            .map(function (s) { return s.split('='); })
            .filter(function (kv) { return kv[0] === 'scenario'; });
          return scenarioParams[0][1];
        }
        else {
          return undefined;
        }
      }
    };
  })

  .run([
    '$window',
    'scenarioMocks',
    'scenarioName',
    function ($window, scenarioMocks, scenarioName) {
      // load a scenario based on URL string,
      // e.g. http://example.com/?scenario=scenario1
      scenarioMocks.setup(scenarioName.extract($window.location.search));
    }
  ]);
