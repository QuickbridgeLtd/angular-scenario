/* global describe, console, beforeEach, module, inject, it, expect, iit */

describe('pollingScenarioPlugin', function () {
  var pollingResponsePlugin, mockResponse, mockWithoutPollCountSet,
    responseArray;

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
    responseArray = [200, mockResponse.response, []];

    module('pollingScenarioPlugin');
    inject(function (_pollingResponsePlugin_) {
      pollingResponsePlugin = _pollingResponsePlugin_;
    });
  });

  it('should return a 204 http status code on the first request', function () {
    // Act.
    var mockResponseArray =
      pollingResponsePlugin(mockResponseArray, mockResponse);

    // Assert.
    expect(mockResponseArray[0]).toBe(204);
  });

  it('should return a 200 http status code on the third request', function () {
    // Arrange.
    pollingResponsePlugin(responseArray, mockResponse);
    pollingResponsePlugin(responseArray, mockResponse);

    // Act.
    var mockResponseArray =
      pollingResponsePlugin(responseArray, mockResponse);

    // Assert.
    expect(mockResponseArray[0]).toBe(200);
  });

  it('should expected polling twice by default', function () {
    // Arrange.
    pollingResponsePlugin(responseArray, mockWithoutPollCountSet);

    // Act.
    var mockResponseArray =
      pollingResponsePlugin(responseArray, mockWithoutPollCountSet);

    // Assert.
    expect(mockResponseArray[0]).toBe(200);
  });

  it('should add headers from the mock response', function () {
    // Arrange.
    mockResponse.headers = {'test': 'header'};

    // Act.
    var mockResponseArray = pollingResponsePlugin(responseArray, mockResponse);

    // Assert.
    expect(mockResponseArray[2].test).toBe('header');
  });

});
