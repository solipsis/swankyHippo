'use strict';

/*!
 * # Semantic UI 2.2.10 - API
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

  "use strict";

  var window = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();

  $.api = $.fn.api = function (parameters) {

    var
    // use window context if none specified
    $allModules = $.isFunction(this) ? $(window) : $(this),
        moduleSelector = $allModules.selector || '',
        time = new Date().getTime(),
        performance = [],
        query = arguments[0],
        methodInvoked = typeof query == 'string',
        queryArguments = [].slice.call(arguments, 1),
        returnedValue;

    $allModules.each(function () {
      var _settings = $.isPlainObject(parameters) ? $.extend(true, {}, $.fn.api.settings, parameters) : $.extend({}, $.fn.api.settings),


      // internal aliases
      namespace = _settings.namespace,
          metadata = _settings.metadata,
          selector = _settings.selector,
          error = _settings.error,
          className = _settings.className,


      // define namespaces for modules
      eventNamespace = '.' + namespace,
          moduleNamespace = 'module-' + namespace,


      // element that creates request
      $module = $(this),
          $form = $module.closest(selector.form),


      // context used for state
      $context = _settings.stateContext ? $(_settings.stateContext) : $module,


      // request details
      ajaxSettings,
          requestSettings,
          url,
          data,
          requestStartTime,


      // standard module
      element = this,
          context = $context[0],
          instance = $module.data(moduleNamespace),
          module;

      module = {

        initialize: function initialize() {
          if (!methodInvoked) {
            module.bind.events();
          }
          module.instantiate();
        },

        instantiate: function instantiate() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module.data(moduleNamespace, instance);
        },

        destroy: function destroy() {
          module.verbose('Destroying previous module for', element);
          $module.removeData(moduleNamespace).off(eventNamespace);
        },

        bind: {
          events: function events() {
            var triggerEvent = module.get.event();
            if (triggerEvent) {
              module.verbose('Attaching API events to element', triggerEvent);
              $module.on(triggerEvent + eventNamespace, module.event.trigger);
            } else if (_settings.on == 'now') {
              module.debug('Querying API endpoint immediately');
              module.query();
            }
          }
        },

        decode: {
          json: function json(response) {
            if (response !== undefined && typeof response == 'string') {
              try {
                response = JSON.parse(response);
              } catch (e) {
                // isnt json string
              }
            }
            return response;
          }
        },

        read: {
          cachedResponse: function cachedResponse(url) {
            var response;
            if (window.Storage === undefined) {
              module.error(error.noStorage);
              return;
            }
            response = sessionStorage.getItem(url);
            module.debug('Using cached response', url, response);
            response = module.decode.json(response);
            return response;
          }
        },
        write: {
          cachedResponse: function cachedResponse(url, response) {
            if (response && response === '') {
              module.debug('Response empty, not caching', response);
              return;
            }
            if (window.Storage === undefined) {
              module.error(error.noStorage);
              return;
            }
            if ($.isPlainObject(response)) {
              response = JSON.stringify(response);
            }
            sessionStorage.setItem(url, response);
            module.verbose('Storing cached response for url', url, response);
          }
        },

        query: function query() {

          if (module.is.disabled()) {
            module.debug('Element is disabled API request aborted');
            return;
          }

          if (module.is.loading()) {
            if (_settings.interruptRequests) {
              module.debug('Interrupting previous request');
              module.abort();
            } else {
              module.debug('Cancelling request, previous request is still pending');
              return;
            }
          }

          // pass element metadata to url (value, text)
          if (_settings.defaultData) {
            $.extend(true, _settings.urlData, module.get.defaultData());
          }

          // Add form content
          if (_settings.serializeForm) {
            _settings.data = module.add.formData(_settings.data);
          }

          // call beforesend and get any settings changes
          requestSettings = module.get.settings();

          // check if before send cancelled request
          if (requestSettings === false) {
            module.cancelled = true;
            module.error(error.beforeSend);
            return;
          } else {
            module.cancelled = false;
          }

          // get url
          url = module.get.templatedURL();

          if (!url && !module.is.mocked()) {
            module.error(error.missingURL);
            return;
          }

          // replace variables
          url = module.add.urlData(url);
          // missing url parameters
          if (!url && !module.is.mocked()) {
            return;
          }

          requestSettings.url = _settings.base + url;

          // look for jQuery ajax parameters in settings
          ajaxSettings = $.extend(true, {}, _settings, {
            type: _settings.method || _settings.type,
            data: data,
            url: _settings.base + url,
            beforeSend: _settings.beforeXHR,
            success: function success() {},
            failure: function failure() {},
            complete: function complete() {}
          });

          module.debug('Querying URL', ajaxSettings.url);
          module.verbose('Using AJAX settings', ajaxSettings);
          if (_settings.cache === 'local' && module.read.cachedResponse(url)) {
            module.debug('Response returned from local cache');
            module.request = module.create.request();
            module.request.resolveWith(context, [module.read.cachedResponse(url)]);
            return;
          }

          if (!_settings.throttle) {
            module.debug('Sending request', data, ajaxSettings.method);
            module.send.request();
          } else {
            if (!_settings.throttleFirstRequest && !module.timer) {
              module.debug('Sending request', data, ajaxSettings.method);
              module.send.request();
              module.timer = setTimeout(function () {}, _settings.throttle);
            } else {
              module.debug('Throttling request', _settings.throttle);
              clearTimeout(module.timer);
              module.timer = setTimeout(function () {
                if (module.timer) {
                  delete module.timer;
                }
                module.debug('Sending throttled request', data, ajaxSettings.method);
                module.send.request();
              }, _settings.throttle);
            }
          }
        },

        should: {
          removeError: function removeError() {
            return _settings.hideError === true || _settings.hideError === 'auto' && !module.is.form();
          }
        },

        is: {
          disabled: function disabled() {
            return $module.filter(selector.disabled).length > 0;
          },
          expectingJSON: function expectingJSON() {
            return _settings.dataType === 'json' || _settings.dataType === 'jsonp';
          },
          form: function form() {
            return $module.is('form') || $context.is('form');
          },
          mocked: function mocked() {
            return _settings.mockResponse || _settings.mockResponseAsync || _settings.response || _settings.responseAsync;
          },
          input: function input() {
            return $module.is('input');
          },
          loading: function loading() {
            return module.request ? module.request.state() == 'pending' : false;
          },
          abortedRequest: function abortedRequest(xhr) {
            if (xhr && xhr.readyState !== undefined && xhr.readyState === 0) {
              module.verbose('XHR request determined to be aborted');
              return true;
            } else {
              module.verbose('XHR request was not aborted');
              return false;
            }
          },
          validResponse: function validResponse(response) {
            if (!module.is.expectingJSON() || !$.isFunction(_settings.successTest)) {
              module.verbose('Response is not JSON, skipping validation', _settings.successTest, response);
              return true;
            }
            module.debug('Checking JSON returned success', _settings.successTest, response);
            if (_settings.successTest(response)) {
              module.debug('Response passed success test', response);
              return true;
            } else {
              module.debug('Response failed success test', response);
              return false;
            }
          }
        },

        was: {
          cancelled: function cancelled() {
            return module.cancelled || false;
          },
          succesful: function succesful() {
            return module.request && module.request.state() == 'resolved';
          },
          failure: function failure() {
            return module.request && module.request.state() == 'rejected';
          },
          complete: function complete() {
            return module.request && (module.request.state() == 'resolved' || module.request.state() == 'rejected');
          }
        },

        add: {
          urlData: function urlData(url, _urlData) {
            var requiredVariables, optionalVariables;
            if (url) {
              requiredVariables = url.match(_settings.regExp.required);
              optionalVariables = url.match(_settings.regExp.optional);
              _urlData = _urlData || _settings.urlData;
              if (requiredVariables) {
                module.debug('Looking for required URL variables', requiredVariables);
                $.each(requiredVariables, function (index, templatedString) {
                  var
                  // allow legacy {$var} style
                  variable = templatedString.indexOf('$') !== -1 ? templatedString.substr(2, templatedString.length - 3) : templatedString.substr(1, templatedString.length - 2),
                      value = $.isPlainObject(_urlData) && _urlData[variable] !== undefined ? _urlData[variable] : $module.data(variable) !== undefined ? $module.data(variable) : $context.data(variable) !== undefined ? $context.data(variable) : _urlData[variable];
                  // remove value
                  if (value === undefined) {
                    module.error(error.requiredParameter, variable, url);
                    url = false;
                    return false;
                  } else {
                    module.verbose('Found required variable', variable, value);
                    value = _settings.encodeParameters ? module.get.urlEncodedValue(value) : value;
                    url = url.replace(templatedString, value);
                  }
                });
              }
              if (optionalVariables) {
                module.debug('Looking for optional URL variables', requiredVariables);
                $.each(optionalVariables, function (index, templatedString) {
                  var
                  // allow legacy {/$var} style
                  variable = templatedString.indexOf('$') !== -1 ? templatedString.substr(3, templatedString.length - 4) : templatedString.substr(2, templatedString.length - 3),
                      value = $.isPlainObject(_urlData) && _urlData[variable] !== undefined ? _urlData[variable] : $module.data(variable) !== undefined ? $module.data(variable) : $context.data(variable) !== undefined ? $context.data(variable) : _urlData[variable];
                  // optional replacement
                  if (value !== undefined) {
                    module.verbose('Optional variable Found', variable, value);
                    url = url.replace(templatedString, value);
                  } else {
                    module.verbose('Optional variable not found', variable);
                    // remove preceding slash if set
                    if (url.indexOf('/' + templatedString) !== -1) {
                      url = url.replace('/' + templatedString, '');
                    } else {
                      url = url.replace(templatedString, '');
                    }
                  }
                });
              }
            }
            return url;
          },
          formData: function formData(data) {
            var canSerialize = $.fn.serializeObject !== undefined,
                formData = canSerialize ? $form.serializeObject() : $form.serialize(),
                hasOtherData;
            data = data || _settings.data;
            hasOtherData = $.isPlainObject(data);

            if (hasOtherData) {
              if (canSerialize) {
                module.debug('Extending existing data with form data', data, formData);
                data = $.extend(true, {}, data, formData);
              } else {
                module.error(error.missingSerialize);
                module.debug('Cant extend data. Replacing data with form data', data, formData);
                data = formData;
              }
            } else {
              module.debug('Adding form data', formData);
              data = formData;
            }
            return data;
          }
        },

        send: {
          request: function request() {
            module.set.loading();
            module.request = module.create.request();
            if (module.is.mocked()) {
              module.mockedXHR = module.create.mockedXHR();
            } else {
              module.xhr = module.create.xhr();
            }
            _settings.onRequest.call(context, module.request, module.xhr);
          }
        },

        event: {
          trigger: function trigger(event) {
            module.query();
            if (event.type == 'submit' || event.type == 'click') {
              event.preventDefault();
            }
          },
          xhr: {
            always: function always() {
              // nothing special
            },
            done: function done(response, textStatus, xhr) {
              var context = this,
                  elapsedTime = new Date().getTime() - requestStartTime,
                  timeLeft = _settings.loadingDuration - elapsedTime,
                  translatedResponse = $.isFunction(_settings.onResponse) ? module.is.expectingJSON() ? _settings.onResponse.call(context, $.extend(true, {}, response)) : _settings.onResponse.call(context, response) : false;
              timeLeft = timeLeft > 0 ? timeLeft : 0;
              if (translatedResponse) {
                module.debug('Modified API response in onResponse callback', _settings.onResponse, translatedResponse, response);
                response = translatedResponse;
              }
              if (timeLeft > 0) {
                module.debug('Response completed early delaying state change by', timeLeft);
              }
              setTimeout(function () {
                if (module.is.validResponse(response)) {
                  module.request.resolveWith(context, [response, xhr]);
                } else {
                  module.request.rejectWith(context, [xhr, 'invalid']);
                }
              }, timeLeft);
            },
            fail: function fail(xhr, status, httpMessage) {
              var context = this,
                  elapsedTime = new Date().getTime() - requestStartTime,
                  timeLeft = _settings.loadingDuration - elapsedTime;
              timeLeft = timeLeft > 0 ? timeLeft : 0;
              if (timeLeft > 0) {
                module.debug('Response completed early delaying state change by', timeLeft);
              }
              setTimeout(function () {
                if (module.is.abortedRequest(xhr)) {
                  module.request.rejectWith(context, [xhr, 'aborted', httpMessage]);
                } else {
                  module.request.rejectWith(context, [xhr, 'error', status, httpMessage]);
                }
              }, timeLeft);
            }
          },
          request: {
            done: function done(response, xhr) {
              module.debug('Successful API Response', response);
              if (_settings.cache === 'local' && url) {
                module.write.cachedResponse(url, response);
                module.debug('Saving server response locally', module.cache);
              }
              _settings.onSuccess.call(context, response, $module, xhr);
            },
            complete: function complete(firstParameter, secondParameter) {
              var xhr, response;
              // have to guess callback parameters based on request success
              if (module.was.succesful()) {
                response = firstParameter;
                xhr = secondParameter;
              } else {
                xhr = firstParameter;
                response = module.get.responseFromXHR(xhr);
              }
              module.remove.loading();
              _settings.onComplete.call(context, response, $module, xhr);
            },
            fail: function fail(xhr, status, httpMessage) {
              var
              // pull response from xhr if available
              response = module.get.responseFromXHR(xhr),
                  errorMessage = module.get.errorFromRequest(response, status, httpMessage);
              if (status == 'aborted') {
                module.debug('XHR Aborted (Most likely caused by page navigation or CORS Policy)', status, httpMessage);
                _settings.onAbort.call(context, status, $module, xhr);
                return true;
              } else if (status == 'invalid') {
                module.debug('JSON did not pass success test. A server-side error has most likely occurred', response);
              } else if (status == 'error') {
                if (xhr !== undefined) {
                  module.debug('XHR produced a server error', status, httpMessage);
                  // make sure we have an error to display to console
                  if (xhr.status != 200 && httpMessage !== undefined && httpMessage !== '') {
                    module.error(error.statusMessage + httpMessage, ajaxSettings.url);
                  }
                  _settings.onError.call(context, errorMessage, $module, xhr);
                }
              }

              if (_settings.errorDuration && status !== 'aborted') {
                module.debug('Adding error state');
                module.set.error();
                if (module.should.removeError()) {
                  setTimeout(module.remove.error, _settings.errorDuration);
                }
              }
              module.debug('API Request failed', errorMessage, xhr);
              _settings.onFailure.call(context, response, $module, xhr);
            }
          }
        },

        create: {

          request: function request() {
            // api request promise
            return $.Deferred().always(module.event.request.complete).done(module.event.request.done).fail(module.event.request.fail);
          },

          mockedXHR: function mockedXHR() {
            var
            // xhr does not simulate these properties of xhr but must return them
            textStatus = false,
                status = false,
                httpMessage = false,
                responder = _settings.mockResponse || _settings.response,
                asyncResponder = _settings.mockResponseAsync || _settings.responseAsync,
                asyncCallback,
                response,
                mockedXHR;

            mockedXHR = $.Deferred().always(module.event.xhr.complete).done(module.event.xhr.done).fail(module.event.xhr.fail);

            if (responder) {
              if ($.isFunction(responder)) {
                module.debug('Using specified synchronous callback', responder);
                response = responder.call(context, requestSettings);
              } else {
                module.debug('Using settings specified response', responder);
                response = responder;
              }
              // simulating response
              mockedXHR.resolveWith(context, [response, textStatus, { responseText: response }]);
            } else if ($.isFunction(asyncResponder)) {
              asyncCallback = function asyncCallback(response) {
                module.debug('Async callback returned response', response);

                if (response) {
                  mockedXHR.resolveWith(context, [response, textStatus, { responseText: response }]);
                } else {
                  mockedXHR.rejectWith(context, [{ responseText: response }, status, httpMessage]);
                }
              };
              module.debug('Using specified async response callback', asyncResponder);
              asyncResponder.call(context, requestSettings, asyncCallback);
            }
            return mockedXHR;
          },

          xhr: function xhr() {
            var xhr;
            // ajax request promise
            xhr = $.ajax(ajaxSettings).always(module.event.xhr.always).done(module.event.xhr.done).fail(module.event.xhr.fail);
            module.verbose('Created server request', xhr, ajaxSettings);
            return xhr;
          }
        },

        set: {
          error: function error() {
            module.verbose('Adding error state to element', $context);
            $context.addClass(className.error);
          },
          loading: function loading() {
            module.verbose('Adding loading state to element', $context);
            $context.addClass(className.loading);
            requestStartTime = new Date().getTime();
          }
        },

        remove: {
          error: function error() {
            module.verbose('Removing error state from element', $context);
            $context.removeClass(className.error);
          },
          loading: function loading() {
            module.verbose('Removing loading state from element', $context);
            $context.removeClass(className.loading);
          }
        },

        get: {
          responseFromXHR: function responseFromXHR(xhr) {
            return $.isPlainObject(xhr) ? module.is.expectingJSON() ? module.decode.json(xhr.responseText) : xhr.responseText : false;
          },
          errorFromRequest: function errorFromRequest(response, status, httpMessage) {
            return $.isPlainObject(response) && response.error !== undefined ? response.error // use json error message
            : _settings.error[status] !== undefined ? // use server error message
            _settings.error[status] : httpMessage;
          },
          request: function request() {
            return module.request || false;
          },
          xhr: function xhr() {
            return module.xhr || false;
          },
          settings: function settings() {
            var runSettings;
            runSettings = _settings.beforeSend.call(context, _settings);
            if (runSettings) {
              if (runSettings.success !== undefined) {
                module.debug('Legacy success callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.success);
                runSettings.onSuccess = runSettings.success;
              }
              if (runSettings.failure !== undefined) {
                module.debug('Legacy failure callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.failure);
                runSettings.onFailure = runSettings.failure;
              }
              if (runSettings.complete !== undefined) {
                module.debug('Legacy complete callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.complete);
                runSettings.onComplete = runSettings.complete;
              }
            }
            if (runSettings === undefined) {
              module.error(error.noReturnedValue);
            }
            if (runSettings === false) {
              return runSettings;
            }
            return runSettings !== undefined ? $.extend(true, {}, runSettings) : $.extend(true, {}, _settings);
          },
          urlEncodedValue: function urlEncodedValue(value) {
            var decodedValue = window.decodeURIComponent(value),
                encodedValue = window.encodeURIComponent(value),
                alreadyEncoded = decodedValue !== value;
            if (alreadyEncoded) {
              module.debug('URL value is already encoded, avoiding double encoding', value);
              return value;
            }
            module.verbose('Encoding value using encodeURIComponent', value, encodedValue);
            return encodedValue;
          },
          defaultData: function defaultData() {
            var data = {};
            if (!$.isWindow(element)) {
              if (module.is.input()) {
                data.value = $module.val();
              } else if (module.is.form()) {} else {
                data.text = $module.text();
              }
            }
            return data;
          },
          event: function event() {
            if ($.isWindow(element) || _settings.on == 'now') {
              module.debug('API called without element, no events attached');
              return false;
            } else if (_settings.on == 'auto') {
              if ($module.is('input')) {
                return element.oninput !== undefined ? 'input' : element.onpropertychange !== undefined ? 'propertychange' : 'keyup';
              } else if ($module.is('form')) {
                return 'submit';
              } else {
                return 'click';
              }
            } else {
              return _settings.on;
            }
          },
          templatedURL: function templatedURL(action) {
            action = action || $module.data(metadata.action) || _settings.action || false;
            url = $module.data(metadata.url) || _settings.url || false;
            if (url) {
              module.debug('Using specified url', url);
              return url;
            }
            if (action) {
              module.debug('Looking up url for action', action, _settings.api);
              if (_settings.api[action] === undefined && !module.is.mocked()) {
                module.error(error.missingAction, _settings.action, _settings.api);
                return;
              }
              url = _settings.api[action];
            } else if (module.is.form()) {
              url = $module.attr('action') || $context.attr('action') || false;
              module.debug('No url or action specified, defaulting to form action', url);
            }
            return url;
          }
        },

        abort: function abort() {
          var xhr = module.get.xhr();
          if (xhr && xhr.state() !== 'resolved') {
            module.debug('Cancelling API request');
            xhr.abort();
          }
        },

        // reset state
        reset: function reset() {
          module.remove.error();
          module.remove.loading();
        },

        setting: function setting(name, value) {
          module.debug('Changing setting', name, value);
          if ($.isPlainObject(name)) {
            $.extend(true, _settings, name);
          } else if (value !== undefined) {
            if ($.isPlainObject(_settings[name])) {
              $.extend(true, _settings[name], value);
            } else {
              _settings[name] = value;
            }
          } else {
            return _settings[name];
          }
        },
        internal: function internal(name, value) {
          if ($.isPlainObject(name)) {
            $.extend(true, module, name);
          } else if (value !== undefined) {
            module[name] = value;
          } else {
            return module[name];
          }
        },
        debug: function debug() {
          if (!_settings.silent && _settings.debug) {
            if (_settings.performance) {
              module.performance.log(arguments);
            } else {
              module.debug = Function.prototype.bind.call(console.info, console, _settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function verbose() {
          if (!_settings.silent && _settings.verbose && _settings.debug) {
            if (_settings.performance) {
              module.performance.log(arguments);
            } else {
              module.verbose = Function.prototype.bind.call(console.info, console, _settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function error() {
          if (!_settings.silent) {
            module.error = Function.prototype.bind.call(console.error, console, _settings.name + ':');
            module.error.apply(console, arguments);
          }
        },
        performance: {
          log: function log(message) {
            var currentTime, executionTime, previousTime;
            if (_settings.performance) {
              currentTime = new Date().getTime();
              previousTime = time || currentTime;
              executionTime = currentTime - previousTime;
              time = currentTime;
              performance.push({
                'Name': message[0],
                'Arguments': [].slice.call(message, 1) || '',
                //'Element'        : element,
                'Execution Time': executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 500);
          },
          display: function display() {
            var title = _settings.name + ':',
                totalTime = 0;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function (index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if (moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if ((console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if (console.table) {
                console.table(performance);
              } else {
                $.each(performance, function (index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time'] + 'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function invoke(query, passedArguments, context) {
          var object = instance,
              maxDepth,
              found,
              response;
          passedArguments = passedArguments || queryArguments;
          context = element || context;
          if (typeof query == 'string' && object !== undefined) {
            query = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function (depth, value) {
              var camelCaseValue = depth != maxDepth ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1) : query;
              if ($.isPlainObject(object[camelCaseValue]) && depth != maxDepth) {
                object = object[camelCaseValue];
              } else if (object[camelCaseValue] !== undefined) {
                found = object[camelCaseValue];
                return false;
              } else if ($.isPlainObject(object[value]) && depth != maxDepth) {
                object = object[value];
              } else if (object[value] !== undefined) {
                found = object[value];
                return false;
              } else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ($.isFunction(found)) {
            response = found.apply(context, passedArguments);
          } else if (found !== undefined) {
            response = found;
          }
          if ($.isArray(returnedValue)) {
            returnedValue.push(response);
          } else if (returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          } else if (response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if (methodInvoked) {
        if (instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      } else {
        if (instance !== undefined) {
          instance.invoke('destroy');
        }
        module.initialize();
      }
    });

    return returnedValue !== undefined ? returnedValue : this;
  };

  $.api.settings = {

    name: 'API',
    namespace: 'api',

    debug: false,
    verbose: false,
    performance: true,

    // object containing all templates endpoints
    api: {},

    // whether to cache responses
    cache: true,

    // whether new requests should abort previous requests
    interruptRequests: true,

    // event binding
    on: 'auto',

    // context for applying state classes
    stateContext: false,

    // duration for loading state
    loadingDuration: 0,

    // whether to hide errors after a period of time
    hideError: 'auto',

    // duration for error state
    errorDuration: 2000,

    // whether parameters should be encoded with encodeURIComponent
    encodeParameters: true,

    // API action to use
    action: false,

    // templated URL to use
    url: false,

    // base URL to apply to all endpoints
    base: '',

    // data that will
    urlData: {},

    // whether to add default data to url data
    defaultData: true,

    // whether to serialize closest form
    serializeForm: false,

    // how long to wait before request should occur
    throttle: 0,

    // whether to throttle first request or only repeated
    throttleFirstRequest: true,

    // standard ajax settings
    method: 'get',
    data: {},
    dataType: 'json',

    // mock response
    mockResponse: false,
    mockResponseAsync: false,

    // aliases for mock
    response: false,
    responseAsync: false,

    // callbacks before request
    beforeSend: function beforeSend(settings) {
      return settings;
    },
    beforeXHR: function beforeXHR(xhr) {},
    onRequest: function onRequest(promise, xhr) {},

    // after request
    onResponse: false, // function(response) { },

    // response was successful, if JSON passed validation
    onSuccess: function onSuccess(response, $module) {},

    // request finished without aborting
    onComplete: function onComplete(response, $module) {},

    // failed JSON success test
    onFailure: function onFailure(response, $module) {},

    // server error
    onError: function onError(errorMessage, $module) {},

    // request aborted
    onAbort: function onAbort(errorMessage, $module) {},

    successTest: false,

    // errors
    error: {
      beforeSend: 'The before send function has aborted the request',
      error: 'There was an error with your request',
      exitConditions: 'API Request Aborted. Exit conditions met',
      JSONParse: 'JSON could not be parsed during error handling',
      legacyParameters: 'You are using legacy API success callback names',
      method: 'The method you called is not defined',
      missingAction: 'API action used but no url was defined',
      missingSerialize: 'jquery-serialize-object is required to add form data to an existing data object',
      missingURL: 'No URL specified for api event',
      noReturnedValue: 'The beforeSend callback must return a settings object, beforeSend ignored.',
      noStorage: 'Caching responses locally requires session storage',
      parseError: 'There was an error parsing your request',
      requiredParameter: 'Missing a required URL parameter: ',
      statusMessage: 'Server gave an error: ',
      timeout: 'Your request timed out'
    },

    regExp: {
      required: /\{\$*[A-z0-9]+\}/g,
      optional: /\{\/\$*[A-z0-9]+\}/g
    },

    className: {
      loading: 'loading',
      error: 'error'
    },

    selector: {
      disabled: '.disabled',
      form: 'form'
    },

    metadata: {
      action: 'action',
      url: 'url'
    }
  };
})(jQuery, window, document);