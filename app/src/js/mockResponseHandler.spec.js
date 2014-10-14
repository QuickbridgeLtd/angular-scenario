/* global angular, describe, beforeEach, jasmine, module, inject, it, xit,
  spyOn, console, expect, iit */

describe('mockResponseHandler', function () {
  var mockResponseHandler, mockResponse, mockPlugin, testHolder;
  beforeEach(function () {

    angular.module('pluginTester', ['scenarioResponse'])
    .config(['mockResponseHandlerProvider',
        function (mockResponseHandlerProvider) {
          mockResponseHandlerProvider.registerResponsePlugin('mockPlugin');
        }]);

    mockResponse =  {
      'uri': 'http://example.com/test',
      'httpMethod': 'GET',
      'statusCode': 200,
      'mockTrigger': true,
      'pollCount': 3,
      'response': {
        'scenario': 'poll',
      }
    };

    testHolder = {
      mockPlugin: function (response, mock) {
        return response;
      }
    };
    spyOn(testHolder, 'mockPlugin');
    module('pluginTester', function ($provide) {
        $provide.value('mockPlugin', testHolder.mockPlugin);
      });

    inject(function (_mockResponseHandler_) {
      mockResponseHandler = _mockResponseHandler_;
    });
  });

  it('should call the plugin function',
    function () {
    // Act.
    mockResponseHandler(mockResponse, {});

    // Assert.
    expect(testHolder.mockPlugin).toHaveBeenCalled();
  });

});
