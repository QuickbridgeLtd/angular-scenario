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
          var plugin,
          response =  [mock.statusCode, mock.response, mockHeaders];
          for (var i = 0; i < responseHandlerPluginRegistry.length; i++) {
            plugin = $injector.get(responseHandlerPluginRegistry[i]);
            response = plugin(response, mock);
          }
          return response;
        };
      }];
    }]);
