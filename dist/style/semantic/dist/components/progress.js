'use strict';

/*!
 * # Semantic UI 2.2.10 - Progress
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

  var global = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();

  $.fn.progress = function (parameters) {
    var $allModules = $(this),
        moduleSelector = $allModules.selector || '',
        time = new Date().getTime(),
        performance = [],
        query = arguments[0],
        methodInvoked = typeof query == 'string',
        queryArguments = [].slice.call(arguments, 1),
        returnedValue;

    $allModules.each(function () {
      var _settings = $.isPlainObject(parameters) ? $.extend(true, {}, $.fn.progress.settings, parameters) : $.extend({}, $.fn.progress.settings),
          className = _settings.className,
          _metadata = _settings.metadata,
          namespace = _settings.namespace,
          selector = _settings.selector,
          error = _settings.error,
          eventNamespace = '.' + namespace,
          moduleNamespace = 'module-' + namespace,
          $module = $(this),
          $bar = $(this).find(selector.bar),
          $progress = $(this).find(selector.progress),
          $label = $(this).find(selector.label),
          element = this,
          instance = $module.data(moduleNamespace),
          animating = false,
          transitionEnd,
          module;

      module = {

        initialize: function initialize() {
          module.debug('Initializing progress bar', _settings);

          module.set.duration();
          module.set.transitionEvent();

          module.read.metadata();
          module.read.settings();

          module.instantiate();
        },

        instantiate: function instantiate() {
          module.verbose('Storing instance of progress', module);
          instance = module;
          $module.data(moduleNamespace, module);
        },
        destroy: function destroy() {
          module.verbose('Destroying previous progress for', $module);
          clearInterval(instance.interval);
          module.remove.state();
          $module.removeData(moduleNamespace);
          instance = undefined;
        },

        reset: function reset() {
          module.remove.nextValue();
          module.update.progress(0);
        },

        complete: function complete() {
          if (module.percent === undefined || module.percent < 100) {
            module.remove.progressPoll();
            module.set.percent(100);
          }
        },

        read: {
          metadata: function metadata() {
            var data = {
              percent: $module.data(_metadata.percent),
              total: $module.data(_metadata.total),
              value: $module.data(_metadata.value)
            };
            if (data.percent) {
              module.debug('Current percent value set from metadata', data.percent);
              module.set.percent(data.percent);
            }
            if (data.total) {
              module.debug('Total value set from metadata', data.total);
              module.set.total(data.total);
            }
            if (data.value) {
              module.debug('Current value set from metadata', data.value);
              module.set.value(data.value);
              module.set.progress(data.value);
            }
          },
          settings: function settings() {
            if (_settings.total !== false) {
              module.debug('Current total set in settings', _settings.total);
              module.set.total(_settings.total);
            }
            if (_settings.value !== false) {
              module.debug('Current value set in settings', _settings.value);
              module.set.value(_settings.value);
              module.set.progress(module.value);
            }
            if (_settings.percent !== false) {
              module.debug('Current percent set in settings', _settings.percent);
              module.set.percent(_settings.percent);
            }
          }
        },

        bind: {
          transitionEnd: function transitionEnd(callback) {
            var transitionEnd = module.get.transitionEnd();
            $bar.one(transitionEnd + eventNamespace, function (event) {
              clearTimeout(module.failSafeTimer);
              callback.call(this, event);
            });
            module.failSafeTimer = setTimeout(function () {
              $bar.triggerHandler(transitionEnd);
            }, _settings.duration + _settings.failSafeDelay);
            module.verbose('Adding fail safe timer', module.timer);
          }
        },

        increment: function increment(incrementValue) {
          var maxValue, startValue, newValue;
          if (module.has.total()) {
            startValue = module.get.value();
            incrementValue = incrementValue || 1;
            newValue = startValue + incrementValue;
          } else {
            startValue = module.get.percent();
            incrementValue = incrementValue || module.get.randomValue();

            newValue = startValue + incrementValue;
            maxValue = 100;
            module.debug('Incrementing percentage by', startValue, newValue);
          }
          newValue = module.get.normalizedValue(newValue);
          module.set.progress(newValue);
        },
        decrement: function decrement(decrementValue) {
          var total = module.get.total(),
              startValue,
              newValue;
          if (total) {
            startValue = module.get.value();
            decrementValue = decrementValue || 1;
            newValue = startValue - decrementValue;
            module.debug('Decrementing value by', decrementValue, startValue);
          } else {
            startValue = module.get.percent();
            decrementValue = decrementValue || module.get.randomValue();
            newValue = startValue - decrementValue;
            module.debug('Decrementing percentage by', decrementValue, startValue);
          }
          newValue = module.get.normalizedValue(newValue);
          module.set.progress(newValue);
        },

        has: {
          progressPoll: function progressPoll() {
            return module.progressPoll;
          },
          total: function total() {
            return module.get.total() !== false;
          }
        },

        get: {
          text: function text(templateText) {
            var value = module.value || 0,
                total = module.total || 0,
                percent = animating ? module.get.displayPercent() : module.percent || 0,
                left = module.total > 0 ? total - value : 100 - percent;
            templateText = templateText || '';
            templateText = templateText.replace('{value}', value).replace('{total}', total).replace('{left}', left).replace('{percent}', percent);
            module.verbose('Adding variables to progress bar text', templateText);
            return templateText;
          },

          normalizedValue: function normalizedValue(value) {
            if (value < 0) {
              module.debug('Value cannot decrement below 0');
              return 0;
            }
            if (module.has.total()) {
              if (value > module.total) {
                module.debug('Value cannot increment above total', module.total);
                return module.total;
              }
            } else if (value > 100) {
              module.debug('Value cannot increment above 100 percent');
              return 100;
            }
            return value;
          },

          updateInterval: function updateInterval() {
            if (_settings.updateInterval == 'auto') {
              return _settings.duration;
            }
            return _settings.updateInterval;
          },

          randomValue: function randomValue() {
            module.debug('Generating random increment percentage');
            return Math.floor(Math.random() * _settings.random.max + _settings.random.min);
          },

          numericValue: function numericValue(value) {
            return typeof value === 'string' ? value.replace(/[^\d.]/g, '') !== '' ? +value.replace(/[^\d.]/g, '') : false : value;
          },

          transitionEnd: function transitionEnd() {
            var element = document.createElement('element'),
                transitions = {
              'transition': 'transitionend',
              'OTransition': 'oTransitionEnd',
              'MozTransition': 'transitionend',
              'WebkitTransition': 'webkitTransitionEnd'
            },
                transition;
            for (transition in transitions) {
              if (element.style[transition] !== undefined) {
                return transitions[transition];
              }
            }
          },

          // gets current displayed percentage (if animating values this is the intermediary value)
          displayPercent: function displayPercent() {
            var barWidth = $bar.width(),
                totalWidth = $module.width(),
                minDisplay = parseInt($bar.css('min-width'), 10),
                displayPercent = barWidth > minDisplay ? barWidth / totalWidth * 100 : module.percent;
            return _settings.precision > 0 ? Math.round(displayPercent * (10 * _settings.precision)) / (10 * _settings.precision) : Math.round(displayPercent);
          },

          percent: function percent() {
            return module.percent || 0;
          },
          value: function value() {
            return module.nextValue || module.value || 0;
          },
          total: function total() {
            return module.total || false;
          }
        },

        create: {
          progressPoll: function progressPoll() {
            module.progressPoll = setTimeout(function () {
              module.update.toNextValue();
              module.remove.progressPoll();
            }, module.get.updateInterval());
          }
        },

        is: {
          complete: function complete() {
            return module.is.success() || module.is.warning() || module.is.error();
          },
          success: function success() {
            return $module.hasClass(className.success);
          },
          warning: function warning() {
            return $module.hasClass(className.warning);
          },
          error: function error() {
            return $module.hasClass(className.error);
          },
          active: function active() {
            return $module.hasClass(className.active);
          },
          visible: function visible() {
            return $module.is(':visible');
          }
        },

        remove: {
          progressPoll: function progressPoll() {
            module.verbose('Removing progress poll timer');
            if (module.progressPoll) {
              clearTimeout(module.progressPoll);
              delete module.progressPoll;
            }
          },
          nextValue: function nextValue() {
            module.verbose('Removing progress value stored for next update');
            delete module.nextValue;
          },
          state: function state() {
            module.verbose('Removing stored state');
            delete module.total;
            delete module.percent;
            delete module.value;
          },
          active: function active() {
            module.verbose('Removing active state');
            $module.removeClass(className.active);
          },
          success: function success() {
            module.verbose('Removing success state');
            $module.removeClass(className.success);
          },
          warning: function warning() {
            module.verbose('Removing warning state');
            $module.removeClass(className.warning);
          },
          error: function error() {
            module.verbose('Removing error state');
            $module.removeClass(className.error);
          }
        },

        set: {
          barWidth: function barWidth(value) {
            if (value > 100) {
              module.error(error.tooHigh, value);
            } else if (value < 0) {
              module.error(error.tooLow, value);
            } else {
              $bar.css('width', value + '%');
              $module.attr('data-percent', parseInt(value, 10));
            }
          },
          duration: function duration(_duration) {
            _duration = _duration || _settings.duration;
            _duration = typeof _duration == 'number' ? _duration + 'ms' : _duration;
            module.verbose('Setting progress bar transition duration', _duration);
            $bar.css({
              'transition-duration': _duration
            });
          },
          percent: function percent(_percent) {
            _percent = typeof _percent == 'string' ? +_percent.replace('%', '') : _percent;
            // round display percentage
            _percent = _settings.precision > 0 ? Math.round(_percent * (10 * _settings.precision)) / (10 * _settings.precision) : Math.round(_percent);
            module.percent = _percent;
            if (!module.has.total()) {
              module.value = _settings.precision > 0 ? Math.round(_percent / 100 * module.total * (10 * _settings.precision)) / (10 * _settings.precision) : Math.round(_percent / 100 * module.total * 10) / 10;
              if (_settings.limitValues) {
                module.value = module.value > 100 ? 100 : module.value < 0 ? 0 : module.value;
              }
            }
            module.set.barWidth(_percent);
            module.set.labelInterval();
            module.set.labels();
            _settings.onChange.call(element, _percent, module.value, module.total);
          },
          labelInterval: function labelInterval() {
            var animationCallback = function animationCallback() {
              module.verbose('Bar finished animating, removing continuous label updates');
              clearInterval(module.interval);
              animating = false;
              module.set.labels();
            };
            clearInterval(module.interval);
            module.bind.transitionEnd(animationCallback);
            animating = true;
            module.interval = setInterval(function () {
              var isInDOM = $.contains(document.documentElement, element);
              if (!isInDOM) {
                clearInterval(module.interval);
                animating = false;
              }
              module.set.labels();
            }, _settings.framerate);
          },
          labels: function labels() {
            module.verbose('Setting both bar progress and outer label text');
            module.set.barLabel();
            module.set.state();
          },
          label: function label(text) {
            text = text || '';
            if (text) {
              text = module.get.text(text);
              module.verbose('Setting label to text', text);
              $label.text(text);
            }
          },
          state: function state(percent) {
            percent = percent !== undefined ? percent : module.percent;
            if (percent === 100) {
              if (_settings.autoSuccess && !(module.is.warning() || module.is.error() || module.is.success())) {
                module.set.success();
                module.debug('Automatically triggering success at 100%');
              } else {
                module.verbose('Reached 100% removing active state');
                module.remove.active();
                module.remove.progressPoll();
              }
            } else if (percent > 0) {
              module.verbose('Adjusting active progress bar label', percent);
              module.set.active();
            } else {
              module.remove.active();
              module.set.label(_settings.text.active);
            }
          },
          barLabel: function barLabel(text) {
            if (text !== undefined) {
              $progress.text(module.get.text(text));
            } else if (_settings.label == 'ratio' && module.total) {
              module.verbose('Adding ratio to bar label');
              $progress.text(module.get.text(_settings.text.ratio));
            } else if (_settings.label == 'percent') {
              module.verbose('Adding percentage to bar label');
              $progress.text(module.get.text(_settings.text.percent));
            }
          },
          active: function active(text) {
            text = text || _settings.text.active;
            module.debug('Setting active state');
            if (_settings.showActivity && !module.is.active()) {
              $module.addClass(className.active);
            }
            module.remove.warning();
            module.remove.error();
            module.remove.success();
            text = _settings.onLabelUpdate('active', text, module.value, module.total);
            if (text) {
              module.set.label(text);
            }
            module.bind.transitionEnd(function () {
              _settings.onActive.call(element, module.value, module.total);
            });
          },
          success: function success(text) {
            text = text || _settings.text.success || _settings.text.active;
            module.debug('Setting success state');
            $module.addClass(className.success);
            module.remove.active();
            module.remove.warning();
            module.remove.error();
            module.complete();
            if (_settings.text.success) {
              text = _settings.onLabelUpdate('success', text, module.value, module.total);
              module.set.label(text);
            } else {
              text = _settings.onLabelUpdate('active', text, module.value, module.total);
              module.set.label(text);
            }
            module.bind.transitionEnd(function () {
              _settings.onSuccess.call(element, module.total);
            });
          },
          warning: function warning(text) {
            text = text || _settings.text.warning;
            module.debug('Setting warning state');
            $module.addClass(className.warning);
            module.remove.active();
            module.remove.success();
            module.remove.error();
            module.complete();
            text = _settings.onLabelUpdate('warning', text, module.value, module.total);
            if (text) {
              module.set.label(text);
            }
            module.bind.transitionEnd(function () {
              _settings.onWarning.call(element, module.value, module.total);
            });
          },
          error: function error(text) {
            text = text || _settings.text.error;
            module.debug('Setting error state');
            $module.addClass(className.error);
            module.remove.active();
            module.remove.success();
            module.remove.warning();
            module.complete();
            text = _settings.onLabelUpdate('error', text, module.value, module.total);
            if (text) {
              module.set.label(text);
            }
            module.bind.transitionEnd(function () {
              _settings.onError.call(element, module.value, module.total);
            });
          },
          transitionEvent: function transitionEvent() {
            transitionEnd = module.get.transitionEnd();
          },
          total: function total(totalValue) {
            module.total = totalValue;
          },
          value: function value(_value) {
            module.value = _value;
          },
          progress: function progress(value) {
            if (!module.has.progressPoll()) {
              module.debug('First update in progress update interval, immediately updating', value);
              module.update.progress(value);
              module.create.progressPoll();
            } else {
              module.debug('Updated within interval, setting next update to use new value', value);
              module.set.nextValue(value);
            }
          },
          nextValue: function nextValue(value) {
            module.nextValue = value;
          }
        },

        update: {
          toNextValue: function toNextValue() {
            var nextValue = module.nextValue;
            if (nextValue) {
              module.debug('Update interval complete using last updated value', nextValue);
              module.update.progress(nextValue);
              module.remove.nextValue();
            }
          },
          progress: function progress(value) {
            var percentComplete;
            value = module.get.numericValue(value);
            if (value === false) {
              module.error(error.nonNumeric, value);
            }
            value = module.get.normalizedValue(value);
            if (module.has.total()) {
              module.set.value(value);
              percentComplete = value / module.total * 100;
              module.debug('Calculating percent complete from total', percentComplete);
              module.set.percent(percentComplete);
            } else {
              percentComplete = value;
              module.debug('Setting value to exact percentage value', percentComplete);
              module.set.percent(percentComplete);
            }
          }
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
                'Element': element,
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

  $.fn.progress.settings = {

    name: 'Progress',
    namespace: 'progress',

    silent: false,
    debug: false,
    verbose: false,
    performance: true,

    random: {
      min: 2,
      max: 5
    },

    duration: 300,

    updateInterval: 'auto',

    autoSuccess: true,
    showActivity: true,
    limitValues: true,

    label: 'percent',
    precision: 0,
    framerate: 1000 / 30, /// 30 fps

    percent: false,
    total: false,
    value: false,

    // delay in ms for fail safe animation callback
    failSafeDelay: 100,

    onLabelUpdate: function onLabelUpdate(state, text, value, total) {
      return text;
    },
    onChange: function onChange(percent, value, total) {},
    onSuccess: function onSuccess(total) {},
    onActive: function onActive(value, total) {},
    onError: function onError(value, total) {},
    onWarning: function onWarning(value, total) {},

    error: {
      method: 'The method you called is not defined.',
      nonNumeric: 'Progress value is non numeric',
      tooHigh: 'Value specified is above 100%',
      tooLow: 'Value specified is below 0%'
    },

    regExp: {
      variable: /\{\$*[A-z0-9]+\}/g
    },

    metadata: {
      percent: 'percent',
      total: 'total',
      value: 'value'
    },

    selector: {
      bar: '> .bar',
      label: '> .label',
      progress: '.bar > .progress'
    },

    text: {
      active: false,
      error: false,
      success: false,
      warning: false,
      percent: '{percent}%',
      ratio: '{value} of {total}'
    },

    className: {
      active: 'active',
      error: 'error',
      success: 'success',
      warning: 'warning'
    }

  };
})(jQuery, window, document);