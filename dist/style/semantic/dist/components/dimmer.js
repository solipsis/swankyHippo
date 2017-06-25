'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * # Semantic UI 2.2.10 - Dimmer
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

  $.fn.dimmer = function (parameters) {
    var $allModules = $(this),
        time = new Date().getTime(),
        performance = [],
        query = arguments[0],
        methodInvoked = typeof query == 'string',
        queryArguments = [].slice.call(arguments, 1),
        returnedValue;

    $allModules.each(function () {
      var settings = $.isPlainObject(parameters) ? $.extend(true, {}, $.fn.dimmer.settings, parameters) : $.extend({}, $.fn.dimmer.settings),
          selector = settings.selector,
          namespace = settings.namespace,
          className = settings.className,
          error = settings.error,
          eventNamespace = '.' + namespace,
          moduleNamespace = 'module-' + namespace,
          moduleSelector = $allModules.selector || '',
          clickEvent = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click',
          $module = $(this),
          $dimmer,
          $dimmable,
          element = this,
          instance = $module.data(moduleNamespace),
          module;

      module = {

        preinitialize: function preinitialize() {
          if (module.is.dimmer()) {

            $dimmable = $module.parent();
            $dimmer = $module;
          } else {
            $dimmable = $module;
            if (module.has.dimmer()) {
              if (settings.dimmerName) {
                $dimmer = $dimmable.find(selector.dimmer).filter('.' + settings.dimmerName);
              } else {
                $dimmer = $dimmable.find(selector.dimmer);
              }
            } else {
              $dimmer = module.create();
            }
            module.set.variation();
          }
        },

        initialize: function initialize() {
          module.debug('Initializing dimmer', settings);

          module.bind.events();
          module.set.dimmable();
          module.instantiate();
        },

        instantiate: function instantiate() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module.data(moduleNamespace, instance);
        },

        destroy: function destroy() {
          module.verbose('Destroying previous module', $dimmer);
          module.unbind.events();
          module.remove.variation();
          $dimmable.off(eventNamespace);
        },

        bind: {
          events: function events() {
            if (settings.on == 'hover') {
              $dimmable.on('mouseenter' + eventNamespace, module.show).on('mouseleave' + eventNamespace, module.hide);
            } else if (settings.on == 'click') {
              $dimmable.on(clickEvent + eventNamespace, module.toggle);
            }
            if (module.is.page()) {
              module.debug('Setting as a page dimmer', $dimmable);
              module.set.pageDimmer();
            }

            if (module.is.closable()) {
              module.verbose('Adding dimmer close event', $dimmer);
              $dimmable.on(clickEvent + eventNamespace, selector.dimmer, module.event.click);
            }
          }
        },

        unbind: {
          events: function events() {
            $module.removeData(moduleNamespace);
            $dimmable.off(eventNamespace);
          }
        },

        event: {
          click: function click(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if ($dimmer.find(event.target).length === 0 || $(event.target).is(selector.content)) {
              module.hide();
              event.stopImmediatePropagation();
            }
          }
        },

        addContent: function addContent(element) {
          var $content = $(element);
          module.debug('Add content to dimmer', $content);
          if ($content.parent()[0] !== $dimmer[0]) {
            $content.detach().appendTo($dimmer);
          }
        },

        create: function create() {
          var $element = $(settings.template.dimmer());
          if (settings.dimmerName) {
            module.debug('Creating named dimmer', settings.dimmerName);
            $element.addClass(settings.dimmerName);
          }
          $element.appendTo($dimmable);
          return $element;
        },

        show: function show(callback) {
          callback = $.isFunction(callback) ? callback : function () {};
          module.debug('Showing dimmer', $dimmer, settings);
          if ((!module.is.dimmed() || module.is.animating()) && module.is.enabled()) {
            module.animate.show(callback);
            settings.onShow.call(element);
            settings.onChange.call(element);
          } else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function hide(callback) {
          callback = $.isFunction(callback) ? callback : function () {};
          if (module.is.dimmed() || module.is.animating()) {
            module.debug('Hiding dimmer', $dimmer);
            module.animate.hide(callback);
            settings.onHide.call(element);
            settings.onChange.call(element);
          } else {
            module.debug('Dimmer is not visible');
          }
        },

        toggle: function toggle() {
          module.verbose('Toggling dimmer visibility', $dimmer);
          if (!module.is.dimmed()) {
            module.show();
          } else {
            module.hide();
          }
        },

        animate: {
          show: function show(callback) {
            callback = $.isFunction(callback) ? callback : function () {};
            if (settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              if (settings.opacity !== 'auto') {
                module.set.opacity();
              }
              $dimmer.transition({
                animation: settings.transition + ' in',
                queue: false,
                duration: module.get.duration(),
                useFailSafe: true,
                onStart: function onStart() {
                  module.set.dimmed();
                },
                onComplete: function onComplete() {
                  module.set.active();
                  callback();
                }
              });
            } else {
              module.verbose('Showing dimmer animation with javascript');
              module.set.dimmed();
              if (settings.opacity == 'auto') {
                settings.opacity = 0.8;
              }
              $dimmer.stop().css({
                opacity: 0,
                width: '100%',
                height: '100%'
              }).fadeTo(module.get.duration(), settings.opacity, function () {
                $dimmer.removeAttr('style');
                module.set.active();
                callback();
              });
            }
          },
          hide: function hide(callback) {
            callback = $.isFunction(callback) ? callback : function () {};
            if (settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              module.verbose('Hiding dimmer with css');
              $dimmer.transition({
                animation: settings.transition + ' out',
                queue: false,
                duration: module.get.duration(),
                useFailSafe: true,
                onStart: function onStart() {
                  module.remove.dimmed();
                },
                onComplete: function onComplete() {
                  module.remove.active();
                  callback();
                }
              });
            } else {
              module.verbose('Hiding dimmer with javascript');
              module.remove.dimmed();
              $dimmer.stop().fadeOut(module.get.duration(), function () {
                module.remove.active();
                $dimmer.removeAttr('style');
                callback();
              });
            }
          }
        },

        get: {
          dimmer: function dimmer() {
            return $dimmer;
          },
          duration: function duration() {
            if (_typeof(settings.duration) == 'object') {
              if (module.is.active()) {
                return settings.duration.hide;
              } else {
                return settings.duration.show;
              }
            }
            return settings.duration;
          }
        },

        has: {
          dimmer: function dimmer() {
            if (settings.dimmerName) {
              return $module.find(selector.dimmer).filter('.' + settings.dimmerName).length > 0;
            } else {
              return $module.find(selector.dimmer).length > 0;
            }
          }
        },

        is: {
          active: function active() {
            return $dimmer.hasClass(className.active);
          },
          animating: function animating() {
            return $dimmer.is(':animated') || $dimmer.hasClass(className.animating);
          },
          closable: function closable() {
            if (settings.closable == 'auto') {
              if (settings.on == 'hover') {
                return false;
              }
              return true;
            }
            return settings.closable;
          },
          dimmer: function dimmer() {
            return $module.hasClass(className.dimmer);
          },
          dimmable: function dimmable() {
            return $module.hasClass(className.dimmable);
          },
          dimmed: function dimmed() {
            return $dimmable.hasClass(className.dimmed);
          },
          disabled: function disabled() {
            return $dimmable.hasClass(className.disabled);
          },
          enabled: function enabled() {
            return !module.is.disabled();
          },
          page: function page() {
            return $dimmable.is('body');
          },
          pageDimmer: function pageDimmer() {
            return $dimmer.hasClass(className.pageDimmer);
          }
        },

        can: {
          show: function show() {
            return !$dimmer.hasClass(className.disabled);
          }
        },

        set: {
          opacity: function opacity(_opacity) {
            var color = $dimmer.css('background-color'),
                colorArray = color.split(','),
                isRGB = colorArray && colorArray.length == 3,
                isRGBA = colorArray && colorArray.length == 4;
            _opacity = settings.opacity === 0 ? 0 : settings.opacity || _opacity;
            if (isRGB || isRGBA) {
              colorArray[3] = _opacity + ')';
              color = colorArray.join(',');
            } else {
              color = 'rgba(0, 0, 0, ' + _opacity + ')';
            }
            module.debug('Setting opacity to', _opacity);
            $dimmer.css('background-color', color);
          },
          active: function active() {
            $dimmer.addClass(className.active);
          },
          dimmable: function dimmable() {
            $dimmable.addClass(className.dimmable);
          },
          dimmed: function dimmed() {
            $dimmable.addClass(className.dimmed);
          },
          pageDimmer: function pageDimmer() {
            $dimmer.addClass(className.pageDimmer);
          },
          disabled: function disabled() {
            $dimmer.addClass(className.disabled);
          },
          variation: function variation(_variation) {
            _variation = _variation || settings.variation;
            if (_variation) {
              $dimmer.addClass(_variation);
            }
          }
        },

        remove: {
          active: function active() {
            $dimmer.removeClass(className.active);
          },
          dimmed: function dimmed() {
            $dimmable.removeClass(className.dimmed);
          },
          disabled: function disabled() {
            $dimmer.removeClass(className.disabled);
          },
          variation: function variation(_variation2) {
            _variation2 = _variation2 || settings.variation;
            if (_variation2) {
              $dimmer.removeClass(_variation2);
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
            if ($allModules.length > 1) {
              title += ' ' + '(' + $allModules.length + ')';
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

      module.preinitialize();

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

  $.fn.dimmer.settings = {

    name: 'Dimmer',
    namespace: 'dimmer',

    silent: false,
    debug: false,
    verbose: false,
    performance: true,

    // name to distinguish between multiple dimmers in context
    dimmerName: false,

    // whether to add a variation type
    variation: false,

    // whether to bind close events
    closable: 'auto',

    // whether to use css animations
    useCSS: true,

    // css animation to use
    transition: 'fade',

    // event to bind to
    on: false,

    // overriding opacity value
    opacity: 'auto',

    // transition durations
    duration: {
      show: 500,
      hide: 500
    },

    onChange: function onChange() {},
    onShow: function onShow() {},
    onHide: function onHide() {},

    error: {
      method: 'The method you called is not defined.'
    },

    className: {
      active: 'active',
      animating: 'animating',
      dimmable: 'dimmable',
      dimmed: 'dimmed',
      dimmer: 'dimmer',
      disabled: 'disabled',
      hide: 'hide',
      pageDimmer: 'page',
      show: 'show'
    },

    selector: {
      dimmer: '> .ui.dimmer',
      content: '.ui.dimmer > .content, .ui.dimmer > .content > .center'
    },

    template: {
      dimmer: function dimmer() {
        return $('<div />').attr('class', 'ui dimmer');
      }
    }

  };
})(jQuery, window, document);