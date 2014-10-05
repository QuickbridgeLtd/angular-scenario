/* global angular, _, console */
angular
  .module('pollingScenarioPlugin', ['scenarioResponse'])
  .config(['mockResponseHandlerProvider',
    function (mockResponseHandlerProvider) {
      mockResponseHandlerProvider
        .registerResponsePlugin('pollingResponsePlugin');
    }
  ])
  .factory('pollingResponsePlugin', [function () {
      var headers = {};

      return {
        trigger: 'poll',
        setHeaders: function (_headers_) {
          headers = _headers_;
        },

        execute: function (mock) {
          var pollCounter = 0;
          var pollCount = _.has(mock, 'pollCount') ? mock.pollCount : 2;

          return function () {
            pollCounter++;
            if (pollCounter < pollCount) {
              return [204, {}, headers];
            }
            pollCounter = 0;
            return [mock.statusCode, mock.response, headers];
          };
        }
      };
    }]);
