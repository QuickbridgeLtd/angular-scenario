/* global angular, describe, beforeEach, jasmine, module, inject, it, xit,
  spyOn, console, expect */

describe('mockResponseHandler', function () {
  var mockResponseHandler, mockResponseWithTrigger, mockWithoutTrigger,
    mockPlugin;
  beforeEach(function () {

    angular.module('pluginTester', ['scenarioResponse'])
    .config(['mockResponseHandlerProvider',
        function (mockResponseHandlerProvider) {
          mockResponseHandlerProvider.registerResponsePlugin('mockPlugin');
        }]);

    mockResponseWithTrigger =  {
      'uri': 'http://example.com/test',
      'httpMethod': 'GET',
      'statusCode': 200,
      'mockTrigger': true,
      'pollCount': 3,
      'response': {
        'scenario': 'poll',
      }
    };
    mockWithoutTrigger =  {
      'uri': 'http://example.com/test',
      'statusCode': 200,
      'httpMethod': 'GET',
      'response': {
        'scenario': 'standard',
      }
    };

    mockPlugin = {
      trigger: 'mockTrigger',
      setHeaders: function () {},
      execute: function () {
        return 'mockResponse';
      }
    };
    module('pluginTester', function ($provide) {
        $provide.value('mockPlugin', mockPlugin);
      });

    inject(function (_mockResponseHandler_) {
      mockResponseHandler = _mockResponseHandler_;
    });
  });

  it('should use a plugin when its trigger parameter is present',
    function () {
    // Act.
    var pluginResponseCallback =
      mockResponseHandler(mockResponseWithTrigger, {})[0];

    // Assert.
    expect(pluginResponseCallback).toBe('mockResponse');
  });

  it('should return the default response value if no trigger is present',
    function () {
    // Act.
    var pluginResponseArray =
      mockResponseHandler(mockWithoutTrigger, {});

    // Assert.
    expect(pluginResponseArray).toEqual([200, {scenario: 'standard'}, {}]);
  });

  it('should use the specified headers for default responses',
    function () {
    // Act.
    var pluginResponseArray =
      mockResponseHandler(mockWithoutTrigger, {test: 'header'});

    // Assert.
    expect(pluginResponseArray[2]).toEqual({test: 'header'});
  });

  it('should pass in the specified headers to the plugin callback',
    function () {
    // Arrange.
    spyOn(mockPlugin, 'setHeaders');

    // Act.
    var mockHeaders = {test: 'header'};
    var pluginResponseArray =
      mockResponseHandler(mockResponseWithTrigger, mockHeaders);

    // Assert.
    expect(mockPlugin.setHeaders).toHaveBeenCalledWith(mockHeaders);
  });

});
