/* global angular, _, console */

angular
  .module('scenario', ['scenarioResponse', 'ui.router'])

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
    'mockResponseHandler',
    function ($q, $http, $httpBackend, scenarioMockData, mockResponseHandler) {

      var setupHttpBackendForMockResource = function (deferred, mock) {
        var mockHeaders = {
          'Content-Type': 'application/vnd.wonga.rest+json; charset=utf-8'
        };

        var requestCondition = $httpBackend
        .when(mock.httpMethod, mock.uri, mock.requestData)
        .respond.apply(null, mockResponseHandler(mock, mockHeaders));

        // Make this http request now if required otherwise just resolve
        if (mock.callInSetup) {
          var req = {method: mock.httpMethod, url: mock.uri};
          $http(req).success(function (response) {
            deferred.resolve();
          });
        }
        else {
          deferred.resolve();
        }
      };

      return {
        setup: function (scenarioName) {
          var deferred = $q.defer(),
            actualScenarioName = scenarioName ||
              scenarioMockData.getDefaultScenario(),
            mockData = scenarioMockData.getMockData();

          if (_.has(mockData, actualScenarioName)) {
            var scenario = mockData[actualScenarioName];

            // Set mock for each item.
            _.forOwn(scenario, function (mock) {
              setupHttpBackendForMockResource(deferred, mock);
            });
          }
          else if (scenarioName) {
            // only write to console if scenario actively specified
            console.log('Mocks not found for: ' + scenarioName);
          }

          return deferred.promise;
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

  .controller('scenarioController', [ '$state', '$stateParams', 'scenarioMocks',
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

