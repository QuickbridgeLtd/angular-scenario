/* global describe, beforeEach, module, inject, it, expect */

describe('pollingScenarioPlugin', function () {
  var pollingResponsePlugin, mockResponse, mockWithoutPollCountSet;
  beforeEach(function () {

    mockResponse =  {
      'uri': 'http://example.com/test',
      'httpMethod': 'GET',
      'statusCode': 200,
      'poll': true,
      'pollCount': 3,
      'response': {
        'scenario': 'poll',
      }
    };
    mockWithoutPollCountSet =  {
      'uri': 'http://example.com/test',
      'httpMethod': 'GET',
      'statusCode': 200,
      'poll': true,
      'response': {
        'scenario': 'poll',
      }
    };
    module('pollingScenarioPlugin');
    inject(function (_pollingResponsePlugin_) {
      pollingResponsePlugin = _pollingResponsePlugin_;
    });
  });

  it('should return a 204 http status code on the first request', function () {
    // Act.
    var mockResponseArray = pollingResponsePlugin.execute().apply();

    // Assert.
    expect(mockResponseArray[0]).toBe(204);
  });

  it('should return a 200 http status code on the third request', function () {
    // Arrange.
    var mockResponseCallback = pollingResponsePlugin.execute(mockResponse);
    mockResponseCallback.apply();
    mockResponseCallback.apply();

    // Act.
    var mockResponseArray = mockResponseCallback.apply();

    // Assert.
    expect(mockResponseArray[0]).toBe(200);
  });

  it('should expected polling twice by default', function () {
    // Arrange.
    var mockResponseCallback = pollingResponsePlugin
    .execute(mockWithoutPollCountSet);
    mockResponseCallback.apply();

    // Act.
    var mockResponseArray = mockResponseCallback.apply();

    // Assert.
    expect(mockResponseArray[0]).toBe(200);
  });

  it('should allow headers to be set for mock responses', function () {
    // Arrange.
    pollingResponsePlugin.setHeaders({'test': 'header'});
    var mockResponseCallback = pollingResponsePlugin.execute(mockResponse);

    // Act.
    var mockResponseArray = mockResponseCallback.apply();

    // Assert.
    expect(mockResponseArray[2].test).toBe('header');
  });

});
