'use strict';

/*!
 * # Semantic UI 2.2.10 - Rating
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

  $.fn.rating = function (parameters) {
    var $allModules = $(this),
        moduleSelector = $allModules.selector || '',
        time = new Date().getTime(),
        performance = [],
        query = arguments[0],
        methodInvoked = typeof query == 'string',
        queryArguments = [].slice.call(arguments, 1),
        returnedValue;
    $allModules.each(function () {
      var settings = $.isPlainObject(parameters) ? $.extend(true, {}, $.fn.rating.settings, parameters) : $.extend({}, $.fn.rating.settings),
          namespace = settings.namespace,
          className = settings.className,
          metadata = settings.metadata,
          selector = settings.selector,
          error = settings.error,
          eventNamespace = '.' + namespace,
          moduleNamespace = 'module-' + namespace,
          element = this,
          instance = $(this).data(moduleNamespace),
          $module = $(this),
          $icon = $module.find(selector.icon),
          _initialLoad,
          module;

      module = {

        initialize: function initialize() {
          module.verbose('Initializing rating module', settings);

          if ($icon.length === 0) {
            module.setup.layout();
          }

          if (settings.interactive) {
            module.enable();
          } else {
            module.disable();
          }
          module.set.initialLoad();
          module.set.rating(module.get.initialRating());
          module.remove.initialLoad();
          module.instantiate();
        },

        instantiate: function instantiate() {
          module.verbose('Instantiating module', settings);
          instance = module;
          $module.data(moduleNamespace, module);
        },

        destroy: function destroy() {
          module.verbose('Destroying previous instance', instance);
          module.remove.events();
          $module.removeData(moduleNamespace);
        },

        refresh: function refresh() {
          $icon = $module.find(selector.icon);
        },

        setup: {
          layout: function layout() {
            var maxRating = module.get.maxRating(),
                html = $.fn.rating.settings.templates.icon(maxRating);
            module.debug('Generating icon html dynamically');
            $module.html(html);
            module.refresh();
          }
        },

        event: {
          mouseenter: function mouseenter() {
            var $activeIcon = $(this);
            $activeIcon.nextAll().removeClass(className.selected);
            $module.addClass(className.selected);
            $activeIcon.addClass(className.selected).prevAll().addClass(className.selected);
          },
          mouseleave: function mouseleave() {
            $module.removeClass(className.selected);
            $icon.removeClass(className.selected);
          },
          click: function click() {
            var $activeIcon = $(this),
                currentRating = module.get.rating(),
                rating = $icon.index($activeIcon) + 1,
                canClear = settings.clearable == 'auto' ? $icon.length === 1 : settings.clearable;
            if (canClear && currentRating == rating) {
              module.clearRating();
            } else {
              module.set.rating(rating);
            }
          }
        },

        clearRating: function clearRating() {
          module.debug('Clearing current rating');
          module.set.rating(0);
        },

        bind: {
          events: function events() {
            module.verbose('Binding events');
            $module.on('mouseenter' + eventNamespace, selector.icon, module.event.mouseenter).on('mouseleave' + eventNamespace, selector.icon, module.event.mouseleave).on('click' + eventNamespace, selector.icon, module.event.click);
          }
        },

        remove: {
          events: function events() {
            module.verbose('Removing events');
            $module.off(eventNamespace);
          },
          initialLoad: function initialLoad() {
            _initialLoad = false;
          }
        },

        enable: function enable() {
          module.debug('Setting rating to interactive mode');
          module.bind.events();
          $module.removeClass(className.disabled);
        },

        disable: function disable() {
          module.debug('Setting rating to read-only mode');
          module.remove.events();
          $module.addClass(className.disabled);
        },

        is: {
          initialLoad: function initialLoad() {
            return _initialLoad;
          }
        },

        get: {
          initialRating: function initialRating() {
            if ($module.data(metadata.rating) !== undefined) {
              $module.removeData(metadata.rating);
              return $module.data(metadata.rating);
            }
            return settings.initialRating;
          },
          maxRating: function maxRating() {
            if ($module.data(metadata.maxRating) !== undefined) {
              $module.removeData(metadata.maxRating);
              return $module.data(metadata.maxRating);
            }
            return settings.maxRating;
          },
          rating: function rating() {
            var currentRating = $icon.filter('.' + className.active).length;
            module.verbose('Current rating retrieved', currentRating);
            return currentRating;
          }
        },

        set: {
          rating: function rating(_rating) {
            var ratingIndex = _rating - 1 >= 0 ? _rating - 1 : 0,
                $activeIcon = $icon.eq(ratingIndex);
            $module.removeClass(className.selected);
            $icon.removeClass(className.selected).removeClass(className.active);
            if (_rating > 0) {
              module.verbose('Setting current rating to', _rating);
              $activeIcon.prevAll().addBack().addClass(className.active);
            }
            if (!module.is.initialLoad()) {
              settings.onRate.call(element, _rating);
            }
          },
          initialLoad: function initialLoad() {
            _initialLoad = true;
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

  $.fn.rating.settings = {

    name: 'Rating',
    namespace: 'rating',

    slent: false,
    debug: false,
    verbose: false,
    performance: true,

    initialRating: 0,
    interactive: true,
    maxRating: 4,
    clearable: 'auto',

    fireOnInit: false,

    onRate: function onRate(rating) {},

    error: {
      method: 'The method you called is not defined',
      noMaximum: 'No maximum rating specified. Cannot generate HTML automatically'
    },

    metadata: {
      rating: 'rating',
      maxRating: 'maxRating'
    },

    className: {
      active: 'active',
      disabled: 'disabled',
      selected: 'selected',
      loading: 'loading'
    },

    selector: {
      icon: '.icon'
    },

    templates: {
      icon: function icon(maxRating) {
        var icon = 1,
            html = '';
        while (icon <= maxRating) {
          html += '<i class="icon"></i>';
          icon++;
        }
        return html;
      }
    }

  };
})(jQuery, window, document);