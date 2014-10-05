/* global angular, _, console */

angular
  .module('scenarioResponse', [])
  .provider('mockResponseHandler', [ function () {

      var responseHandlerPluginRegistry = [];

      this.registerResponsePlugin = function (pluginServiceName) {
        responseHandlerPluginRegistry.push(pluginServiceName);
      };

      this.$get = ['$injector', function ($injector) {
        return function (mock, mockHeaders) {
          for (var i = 0; i < responseHandlerPluginRegistry.length; i++) {
            var plugin = $injector.get(responseHandlerPluginRegistry[i]);
            if (mock[plugin['trigger']] !== undefined) {
              plugin.setHeaders(mockHeaders);
              return [plugin.execute(mock)];
            }
            return [mock.statusCode, mock.response, mockHeaders];
          }
        };
      }];
    }]);
