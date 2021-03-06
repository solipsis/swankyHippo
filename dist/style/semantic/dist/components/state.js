'use strict';

/*!
 * # Semantic UI 2.2.10 - State
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

  "use strict";

  window = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();

  $.fn.state = function (parameters) {
    var $allModules = $(this),
        moduleSelector = $allModules.selector || '',
        hasTouch = 'ontouchstart' in document.documentElement,
        time = new Date().getTime(),
        performance = [],
        query = arguments[0],
        methodInvoked = typeof query == 'string',
        queryArguments = [].slice.call(arguments, 1),
        returnedValue;
    $allModules.each(function () {
      var settings = $.isPlainObject(parameters) ? $.extend(true, {}, $.fn.state.settings, parameters) : $.extend({}, $.fn.state.settings),
          error = settings.error,
          metadata = settings.metadata,
          className = settings.className,
          namespace = settings.namespace,
          states = settings.states,
          _text = settings.text,
          eventNamespace = '.' + namespace,
          moduleNamespace = namespace + '-module',
          $module = $(this),
          element = this,
          instance = $module.data(moduleNamespace),
          module;
      module = {

        initialize: function initialize() {
          module.verbose('Initializing module');

          // allow module to guess desired state based on element
          if (settings.automatic) {
            module.add.defaults();
          }

          // bind events with delegated events
          if (settings.context && moduleSelector !== '') {
            $(settings.context).on(moduleSelector, 'mouseenter' + eventNamespace, module.change.text).on(moduleSelector, 'mouseleave' + eventNamespace, module.reset.text).on(moduleSelector, 'click' + eventNamespace, module.toggle.state);
          } else {
            $module.on('mouseenter' + eventNamespace, module.change.text).on('mouseleave' + eventNamespace, module.reset.text).on('click' + eventNamespace, module.toggle.state);
          }
          module.instantiate();
        },

        instantiate: function instantiate() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module.data(moduleNamespace, module);
        },

        destroy: function destroy() {
          module.verbose('Destroying previous module', instance);
          $module.off(eventNamespace).removeData(moduleNamespace);
        },

        refresh: function refresh() {
          module.verbose('Refreshing selector cache');
          $module = $(element);
        },

        add: {
          defaults: function defaults() {
            var userStates = parameters && $.isPlainObject(parameters.states) ? parameters.states : {};
            $.each(settings.defaults, function (type, typeStates) {
              if (module.is[type] !== undefined && module.is[type]()) {
                module.verbose('Adding default states', type, element);
                $.extend(settings.states, typeStates, userStates);
              }
            });
          }
        },

        is: {

          active: function active() {
            return $module.hasClass(className.active);
          },
          loading: function loading() {
            return $module.hasClass(className.loading);
          },
          inactive: function inactive() {
            return !$module.hasClass(className.active);
          },
          state: function state(_state) {
            if (className[_state] === undefined) {
              return false;
            }
            return $module.hasClass(className[_state]);
          },

          enabled: function enabled() {
            return !$module.is(settings.filter.active);
          },
          disabled: function disabled() {
            return $module.is(settings.filter.active);
          },
          textEnabled: function textEnabled() {
            return !$module.is(settings.filter.text);
          },

          // definitions for automatic type detection
          button: function button() {
            return $module.is('.button:not(a, .submit)');
          },
          input: function input() {
            return $module.is('input');
          },
          progress: function progress() {
            return $module.is('.ui.progress');
          }
        },

        allow: function allow(state) {
          module.debug('Now allowing state', state);
          states[state] = true;
        },
        disallow: function disallow(state) {
          module.debug('No longer allowing', state);
          states[state] = false;
        },

        allows: function allows(state) {
          return states[state] || false;
        },

        enable: function enable() {
          $module.removeClass(className.disabled);
        },

        disable: function disable() {
          $module.addClass(className.disabled);
        },

        setState: function setState(state) {
          if (module.allows(state)) {
            $module.addClass(className[state]);
          }
        },

        removeState: function removeState(state) {
          if (module.allows(state)) {
            $module.removeClass(className[state]);
          }
        },

        toggle: {
          state: function state() {
            var apiRequest, requestCancelled;
            if (module.allows('active') && module.is.enabled()) {
              module.refresh();
              if ($.fn.api !== undefined) {
                apiRequest = $module.api('get request');
                requestCancelled = $module.api('was cancelled');
                if (requestCancelled) {
                  module.debug('API Request cancelled by beforesend');
                  settings.activateTest = function () {
                    return false;
                  };
                  settings.deactivateTest = function () {
                    return false;
                  };
                } else if (apiRequest) {
                  module.listenTo(apiRequest);
                  return;
                }
              }
              module.change.state();
            }
          }
        },

        listenTo: function listenTo(apiRequest) {
          module.debug('API request detected, waiting for state signal', apiRequest);
          if (apiRequest) {
            if (_text.loading) {
              module.update.text(_text.loading);
            }
            $.when(apiRequest).then(function () {
              if (apiRequest.state() == 'resolved') {
                module.debug('API request succeeded');
                settings.activateTest = function () {
                  return true;
                };
                settings.deactivateTest = function () {
                  return true;
                };
              } else {
                module.debug('API request failed');
                settings.activateTest = function () {
                  return false;
                };
                settings.deactivateTest = function () {
                  return false;
                };
              }
              module.change.state();
            });
          }
        },

        // checks whether active/inactive state can be given
        change: {

          state: function state() {
            module.debug('Determining state change direction');
            // inactive to active change
            if (module.is.inactive()) {
              module.activate();
            } else {
              module.deactivate();
            }
            if (settings.sync) {
              module.sync();
            }
            settings.onChange.call(element);
          },

          text: function text() {
            if (module.is.textEnabled()) {
              if (module.is.disabled()) {
                module.verbose('Changing text to disabled text', _text.hover);
                module.update.text(_text.disabled);
              } else if (module.is.active()) {
                if (_text.hover) {
                  module.verbose('Changing text to hover text', _text.hover);
                  module.update.text(_text.hover);
                } else if (_text.deactivate) {
                  module.verbose('Changing text to deactivating text', _text.deactivate);
                  module.update.text(_text.deactivate);
                }
              } else {
                if (_text.hover) {
                  module.verbose('Changing text to hover text', _text.hover);
                  module.update.text(_text.hover);
                } else if (_text.activate) {
                  module.verbose('Changing text to activating text', _text.activate);
                  module.update.text(_text.activate);
                }
              }
            }
          }

        },

        activate: function activate() {
          if (settings.activateTest.call(element)) {
            module.debug('Setting state to active');
            $module.addClass(className.active);
            module.update.text(_text.active);
            settings.onActivate.call(element);
          }
        },

        deactivate: function deactivate() {
          if (settings.deactivateTest.call(element)) {
            module.debug('Setting state to inactive');
            $module.removeClass(className.active);
            module.update.text(_text.inactive);
            settings.onDeactivate.call(element);
          }
        },

        sync: function sync() {
          module.verbose('Syncing other buttons to current state');
          if (module.is.active()) {
            $allModules.not($module).state('activate');
          } else {
            $allModules.not($module).state('deactivate');
          }
        },

        get: {
          text: function text() {
            return settings.selector.text ? $module.find(settings.selector.text).text() : $module.html();
          },
          textFor: function textFor(state) {
            return _text[state] || false;
          }
        },

        flash: {
          text: function text(_text2, duration, callback) {
            var previousText = module.get.text();
            module.debug('Flashing text message', _text2, duration);
            _text2 = _text2 || settings.text.flash;
            duration = duration || settings.flashDuration;
            callback = callback || function () {};
            module.update.text(_text2);
            setTimeout(function () {
              module.update.text(previousText);
              callback.call(element);
            }, duration);
          }
        },

        reset: {
          // on mouseout sets text to previous value
          text: function text() {
            var activeText = _text.active || $module.data(metadata.storedText),
                inactiveText = _text.inactive || $module.data(metadata.storedText);
            if (module.is.textEnabled()) {
              if (module.is.active() && activeText) {
                module.verbose('Resetting active text', activeText);
                module.update.text(activeText);
              } else if (inactiveText) {
                module.verbose('Resetting inactive text', activeText);
                module.update.text(inactiveText);
              }
            }
          }
        },

        update: {
          text: function text(_text3) {
            var currentText = module.get.text();
            if (_text3 && _text3 !== currentText) {
              module.debug('Updating text', _text3);
              if (settings.selector.text) {
                $module.data(metadata.storedText, _text3).find(settings.selector.text).text(_text3);
              } else {
                $module.data(metadata.storedText, _text3).html(_text3);
              }
            } else {
              module.debug('Text is already set, ignoring update', _text3);
            }
          }
        },

        setting: function setting(name, value) {
          module.debug('Changing setting', name, value);
          if ($.isPlainObject(name)) {
            $.extend(true, settings, name);
          } else if (value !== undefined) {
            if ($.isPlainObject(settings[name])) {
              $.extend(true, settings[name], value);
            } else {
              settings[name] = value;
            }
          } else {
            return settings[name];
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
          if (!settings.silent && settings.debug) {
            if (settings.performance) {
              module.performance.log(arguments);
            } else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function verbose() {
          if (!settings.silent && settings.verbose && settings.debug) {
            if (settings.performance) {
              module.performance.log(arguments);
            } else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function error() {
          if (!settings.silent) {
            module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
            module.error.apply(console, arguments);
          }
        },
        performance: {
          log: function log(message) {
            var currentTime, executionTime, previousTime;
            if (settings.performance) {
              currentTime = new Date().getTime();
              previousTime = time || currentTime;
              executionTime = currentTime - previousTime;
              time = currentTime;
              performance.push({
                'Name': message[0],
                'Arguments': [].slice.call(message, 1) || '',
                'Element': element,
                'Execution Time': executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 500);
          },
          display: function display() {
            var title = settings.name + ':',
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

  $.fn.state.settings = {

    // module info
    name: 'State',

    // debug output
    debug: false,

    // verbose debug output
    verbose: false,

    // namespace for events
    namespace: 'state',

    // debug data includes performance
    performance: true,

    // callback occurs on state change
    onActivate: function onActivate() {},
    onDeactivate: function onDeactivate() {},
    onChange: function onChange() {},

    // state test functions
    activateTest: function activateTest() {
      return true;
    },
    deactivateTest: function deactivateTest() {
      return true;
    },

    // whether to automatically map default states
    automatic: true,

    // activate / deactivate changes all elements instantiated at same time
    sync: false,

    // default flash text duration, used for temporarily changing text of an element
    flashDuration: 1000,

    // selector filter
    filter: {
      text: '.loading, .disabled',
      active: '.disabled'
    },

    context: false,

    // error
    error: {
      beforeSend: 'The before send function has cancelled state change',
      method: 'The method you called is not defined.'
    },

    // metadata
    metadata: {
      promise: 'promise',
      storedText: 'stored-text'
    },

    // change class on state
    className: {
      active: 'active',
      disabled: 'disabled',
      error: 'error',
      loading: 'loading',
      success: 'success',
      warning: 'warning'
    },

    selector: {
      // selector for text node
      text: false
    },

    defaults: {
      input: {
        disabled: true,
        loading: true,
        active: true
      },
      button: {
        disabled: true,
        loading: true,
        active: true
      },
      progress: {
        active: true,
        success: true,
        warning: true,
        error: true
      }
    },

    states: {
      active: true,
      disabled: true,
      error: true,
      loading: true,
      success: true,
      warning: true
    },

    text: {
      disabled: false,
      flash: false,
      hover: false,
      active: false,
      inactive: false,
      activate: false,
      deactivate: false
    }

  };
})(jQuery, window, document);