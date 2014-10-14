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
      var pollCounter = 0;

      return function (responseArray, mock) {
        if (typeof mock.poll === undefined || mock.poll === false) {
          return responseArray;
        }
        var pollCount = _.has(mock, 'pollCount') ? mock.pollCount : 2;
        if (typeof mock.headers !== undefined) {
          headers = _.merge(headers, mock.headers);
        }

        return (function () {
          pollCounter++;
          if (pollCounter < pollCount) {
            return [204, {}, headers];
          }
          pollCounter = 0;

          return responseArray;
        }).call();

      };
    }]);
