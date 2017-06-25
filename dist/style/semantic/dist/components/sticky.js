'use strict';

/*!
 * # Semantic UI 2.2.10 - Sticky
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

  $.fn.sticky = function (parameters) {
    var $allModules = $(this),
        moduleSelector = $allModules.selector || '',
        time = new Date().getTime(),
        performance = [],
        query = arguments[0],
        methodInvoked = typeof query == 'string',
        queryArguments = [].slice.call(arguments, 1),
        returnedValue;

    $allModules.each(function () {
      var settings = $.isPlainObject(parameters) ? $.extend(true, {}, $.fn.sticky.settings, parameters) : $.extend({}, $.fn.sticky.settings),
          className = settings.className,
          namespace = settings.namespace,
          error = settings.error,
          eventNamespace = '.' + namespace,
          moduleNamespace = 'module-' + namespace,
          $module = $(this),
          $window = $(window),
          $scroll = $(settings.scrollContext),
          $container,
          $context,
          selector = $module.selector || '',
          instance = $module.data(moduleNamespace),
          requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        setTimeout(callback, 0);
      },
          element = this,
          documentObserver,
          observer,
          module;

      module = {

        initialize: function initialize() {

          module.determineContainer();
          module.determineContext();
          module.verbose('Initializing sticky', settings, $container);

          module.save.positions();
          module.checkErrors();
          module.bind.events();

          if (settings.observeChanges) {
            module.observeChanges();
          }
          module.instantiate();
        },

        instantiate: function instantiate() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module.data(moduleNamespace, module);
        },

        destroy: function destroy() {
          module.verbose('Destroying previous instance');
          module.reset();
          if (documentObserver) {
            documentObserver.disconnect();
          }
          if (observer) {
            observer.disconnect();
          }
          $window.off('load' + eventNamespace, module.event.load).off('resize' + eventNamespace, module.event.resize);
          $scroll.off('scrollchange' + eventNamespace, module.event.scrollchange);
          $module.removeData(moduleNamespace);
        },

        observeChanges: function observeChanges() {
          if ('MutationObserver' in window) {
            documentObserver = new MutationObserver(module.event.documentChanged);
            observer = new MutationObserver(module.event.changed);
            documentObserver.observe(document, {
              childList: true,
              subtree: true
            });
            observer.observe(element, {
              childList: true,
              subtree: true
            });
            observer.observe($context[0], {
              childList: true,
              subtree: true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        determineContainer: function determineContainer() {
          if (settings.container) {
            $container = $(settings.container);
          } else {
            $container = $module.offsetParent();
          }
        },

        determineContext: function determineContext() {
          if (settings.context) {
            $context = $(settings.context);
          } else {
            $context = $container;
          }
          if ($context.length === 0) {
            module.error(error.invalidContext, settings.context, $module);
            return;
          }
        },

        checkErrors: function checkErrors() {
          if (module.is.hidden()) {
            module.error(error.visible, $module);
          }
          if (module.cache.element.height > module.cache.context.height) {
            module.reset();
            module.error(error.elementSize, $module);
            return;
          }
        },

        bind: {
          events: function events() {
            $window.on('load' + eventNamespace, module.event.load).on('resize' + eventNamespace, module.event.resize);
            // pub/sub pattern
            $scroll.off('scroll' + eventNamespace).on('scroll' + eventNamespace, module.event.scroll).on('scrollchange' + eventNamespace, module.event.scrollchange);
          }
        },

        event: {
          changed: function changed(mutations) {
            clearTimeout(module.timer);
            module.timer = setTimeout(function () {
              module.verbose('DOM tree modified, updating sticky menu', mutations);
              module.refresh();
            }, 100);
          },
          documentChanged: function documentChanged(mutations) {
            [].forEach.call(mutations, function (mutation) {
              if (mutation.removedNodes) {
                [].forEach.call(mutation.removedNodes, function (node) {
                  if (node == element || $(node).find(element).length > 0) {
                    module.debug('Element removed from DOM, tearing down events');
                    module.destroy();
                  }
                });
              }
            });
          },
          load: function load() {
            module.verbose('Page contents finished loading');
            requestAnimationFrame(module.refresh);
          },
          resize: function resize() {
            module.verbose('Window resized');
            requestAnimationFrame(module.refresh);
          },
          scroll: function scroll() {
            requestAnimationFrame(function () {
              $scroll.triggerHandler('scrollchange' + eventNamespace, $scroll.scrollTop());
            });
          },
          scrollchange: function scrollchange(event, scrollPosition) {
            module.stick(scrollPosition);
            settings.onScroll.call(element);
          }
        },

        refresh: function refresh(hardRefresh) {
          module.reset();
          if (!settings.context) {
            module.determineContext();
          }
          if (hardRefresh) {
            module.determineContainer();
          }
          module.save.positions();
          module.stick();
          settings.onReposition.call(element);
        },

        supports: {
          sticky: function sticky() {
            var $element = $('<div/>'),
                element = $element[0];
            $element.addClass(className.supported);
            return $element.css('position').match('sticky');
          }
        },

        save: {
          lastScroll: function lastScroll(scroll) {
            module.lastScroll = scroll;
          },
          elementScroll: function elementScroll(scroll) {
            module.elementScroll = scroll;
          },
          positions: function positions() {
            var scrollContext = {
              height: $scroll.height()
            },
                element = {
              margin: {
                top: parseInt($module.css('margin-top'), 10),
                bottom: parseInt($module.css('margin-bottom'), 10)
              },
              offset: $module.offset(),
              width: $module.outerWidth(),
              height: $module.outerHeight()
            },
                context = {
              offset: $context.offset(),
              height: $context.outerHeight()
            },
                container = {
              height: $container.outerHeight()
            };
            if (!module.is.standardScroll()) {
              module.debug('Non-standard scroll. Removing scroll offset from element offset');

              scrollContext.top = $scroll.scrollTop();
              scrollContext.left = $scroll.scrollLeft();

              element.offset.top += scrollContext.top;
              context.offset.top += scrollContext.top;
              element.offset.left += scrollContext.left;
              context.offset.left += scrollContext.left;
            }
            module.cache = {
              fits: element.height < scrollContext.height,
              scrollContext: {
                height: scrollContext.height
              },
              element: {
                margin: element.margin,
                top: element.offset.top - element.margin.top,
                left: element.offset.left,
                width: element.width,
                height: element.height,
                bottom: element.offset.top + element.height
              },
              context: {
                top: context.offset.top,
                height: context.height,
                bottom: context.offset.top + context.height
              }
            };
            module.set.containerSize();
            module.set.size();
            module.stick();
            module.debug('Caching element positions', module.cache);
          }
        },

        get: {
          direction: function direction(scroll) {
            var direction = 'down';
            scroll = scroll || $scroll.scrollTop();
            if (module.lastScroll !== undefined) {
              if (module.lastScroll < scroll) {
                direction = 'down';
              } else if (module.lastScroll > scroll) {
                direction = 'up';
              }
            }
            return direction;
          },
          scrollChange: function scrollChange(scroll) {
            scroll = scroll || $scroll.scrollTop();
            return module.lastScroll ? scroll - module.lastScroll : 0;
          },
          currentElementScroll: function currentElementScroll() {
            if (module.elementScroll) {
              return module.elementScroll;
            }
            return module.is.top() ? Math.abs(parseInt($module.css('top'), 10)) || 0 : Math.abs(parseInt($module.css('bottom'), 10)) || 0;
          },

          elementScroll: function elementScroll(scroll) {
            scroll = scroll || $scroll.scrollTop();
            var element = module.cache.element,
                scrollContext = module.cache.scrollContext,
                delta = module.get.scrollChange(scroll),
                maxScroll = element.height - scrollContext.height + settings.offset,
                elementScroll = module.get.currentElementScroll(),
                possibleScroll = elementScroll + delta;
            if (module.cache.fits || possibleScroll < 0) {
              elementScroll = 0;
            } else if (possibleScroll > maxScroll) {
              elementScroll = maxScroll;
            } else {
              elementScroll = possibleScroll;
            }
            return elementScroll;
          }
        },

        remove: {
          lastScroll: function lastScroll() {
            delete module.lastScroll;
          },
          elementScroll: function elementScroll(scroll) {
            delete module.elementScroll;
          },
          offset: function offset() {
            $module.css('margin-top', '');
          }
        },

        set: {
          offset: function offset() {
            module.verbose('Setting offset on element', settings.offset);
            $module.css('margin-top', settings.offset);
          },
          containerSize: function containerSize() {
            var tagName = $container.get(0).tagName;
            if (tagName === 'HTML' || tagName == 'body') {
              // this can trigger for too many reasons
              //module.error(error.container, tagName, $module);
              module.determineContainer();
            } else {
              if (Math.abs($container.outerHeight() - module.cache.context.height) > settings.jitter) {
                module.debug('Context has padding, specifying exact height for container', module.cache.context.height);
                $container.css({
                  height: module.cache.context.height
                });
              }
            }
          },
          minimumSize: function minimumSize() {
            var element = module.cache.element;
            $container.css('min-height', element.height);
          },
          scroll: function scroll(_scroll) {
            module.debug('Setting scroll on element', _scroll);
            if (module.elementScroll == _scroll) {
              return;
            }
            if (module.is.top()) {
              $module.css('bottom', '').css('top', -_scroll);
            }
            if (module.is.bottom()) {
              $module.css('top', '').css('bottom', _scroll);
            }
          },
          size: function size() {
            if (module.cache.element.height !== 0 && module.cache.element.width !== 0) {
              element.style.setProperty('width', module.cache.element.width + 'px', 'important');
              element.style.setProperty('height', module.cache.element.height + 'px', 'important');
            }
          }
        },

        is: {
          standardScroll: function standardScroll() {
            return $scroll[0] == window;
          },
          top: function top() {
            return $module.hasClass(className.top);
          },
          bottom: function bottom() {
            return $module.hasClass(className.bottom);
          },
          initialPosition: function initialPosition() {
            return !module.is.fixed() && !module.is.bound();
          },
          hidden: function hidden() {
            return !$module.is(':visible');
          },
          bound: function bound() {
            return $module.hasClass(className.bound);
          },
          fixed: function fixed() {
            return $module.hasClass(className.fixed);
          }
        },

        stick: function stick(scroll) {
          var cachedPosition = scroll || $scroll.scrollTop(),
              cache = module.cache,
              fits = cache.fits,
              element = cache.element,
              scrollContext = cache.scrollContext,
              context = cache.context,
              offset = module.is.bottom() && settings.pushing ? settings.bottomOffset : settings.offset,
              scroll = {
            top: cachedPosition + offset,
            bottom: cachedPosition + offset + scrollContext.height
          },
              direction = module.get.direction(scroll.top),
              elementScroll = fits ? 0 : module.get.elementScroll(scroll.top),


          // shorthand
          doesntFit = !fits,
              elementVisible = element.height !== 0;

          if (elementVisible) {

            if (module.is.initialPosition()) {
              if (scroll.top >= context.bottom) {
                module.debug('Initial element position is bottom of container');
                module.bindBottom();
              } else if (scroll.top > element.top) {
                if (element.height + scroll.top - elementScroll >= context.bottom) {
                  module.debug('Initial element position is bottom of container');
                  module.bindBottom();
                } else {
                  module.debug('Initial element position is fixed');
                  module.fixTop();
                }
              }
            } else if (module.is.fixed()) {

              // currently fixed top
              if (module.is.top()) {
                if (scroll.top <= element.top) {
                  module.debug('Fixed element reached top of container');
                  module.setInitialPosition();
                } else if (element.height + scroll.top - elementScroll >= context.bottom) {
                  module.debug('Fixed element reached bottom of container');
                  module.bindBottom();
                }
                // scroll element if larger than screen
                else if (doesntFit) {
                    module.set.scroll(elementScroll);
                    module.save.lastScroll(scroll.top);
                    module.save.elementScroll(elementScroll);
                  }
              }

              // currently fixed bottom
              else if (module.is.bottom()) {

                  // top edge
                  if (scroll.bottom - element.height <= element.top) {
                    module.debug('Bottom fixed rail has reached top of container');
                    module.setInitialPosition();
                  }
                  // bottom edge
                  else if (scroll.bottom >= context.bottom) {
                      module.debug('Bottom fixed rail has reached bottom of container');
                      module.bindBottom();
                    }
                    // scroll element if larger than screen
                    else if (doesntFit) {
                        module.set.scroll(elementScroll);
                        module.save.lastScroll(scroll.top);
                        module.save.elementScroll(elementScroll);
                      }
                }
            } else if (module.is.bottom()) {
              if (scroll.top <= element.top) {
                module.debug('Jumped from bottom fixed to top fixed, most likely used home/end button');
                module.setInitialPosition();
              } else {
                if (settings.pushing) {
                  if (module.is.bound() && scroll.bottom <= context.bottom) {
                    module.debug('Fixing bottom attached element to bottom of browser.');
                    module.fixBottom();
                  }
                } else {
                  if (module.is.bound() && scroll.top <= context.bottom - element.height) {
                    module.debug('Fixing bottom attached element to top of browser.');
                    module.fixTop();
                  }
                }
              }
            }
          }
        },

        bindTop: function bindTop() {
          module.debug('Binding element to top of parent container');
          module.remove.offset();
          $module.css({
            left: '',
            top: '',
            marginBottom: ''
          }).removeClass(className.fixed).removeClass(className.bottom).addClass(className.bound).addClass(className.top);
          settings.onTop.call(element);
          settings.onUnstick.call(element);
        },
        bindBottom: function bindBottom() {
          module.debug('Binding element to bottom of parent container');
          module.remove.offset();
          $module.css({
            left: '',
            top: ''
          }).removeClass(className.fixed).removeClass(className.top).addClass(className.bound).addClass(className.bottom);
          settings.onBottom.call(element);
          settings.onUnstick.call(element);
        },

        setInitialPosition: function setInitialPosition() {
          module.debug('Returning to initial position');
          module.unfix();
          module.unbind();
        },

        fixTop: function fixTop() {
          module.debug('Fixing element to top of page');
          module.set.minimumSize();
          module.set.offset();
          $module.css({
            left: module.cache.element.left,
            bottom: '',
            marginBottom: ''
          }).removeClass(className.bound).removeClass(className.bottom).addClass(className.fixed).addClass(className.top);
          settings.onStick.call(element);
        },

        fixBottom: function fixBottom() {
          module.debug('Sticking element to bottom of page');
          module.set.minimumSize();
          module.set.offset();
          $module.css({
            left: module.cache.element.left,
            bottom: '',
            marginBottom: ''
          }).removeClass(className.bound).removeClass(className.top).addClass(className.fixed).addClass(className.bottom);
          settings.onStick.call(element);
        },

        unbind: function unbind() {
          if (module.is.bound()) {
            module.debug('Removing container bound position on element');
            module.remove.offset();
            $module.removeClass(className.bound).removeClass(className.top).removeClass(className.bottom);
          }
        },

        unfix: function unfix() {
          if (module.is.fixed()) {
            module.debug('Removing fixed position on element');
            module.remove.offset();
            $module.removeClass(className.fixed).removeClass(className.top).removeClass(className.bottom);
            settings.onUnstick.call(element);
          }
        },

        reset: function reset() {
          module.debug('Resetting elements position');
          module.unbind();
          module.unfix();
          module.resetCSS();
          module.remove.offset();
          module.remove.lastScroll();
        },

        resetCSS: function resetCSS() {
          $module.css({
            width: '',
            height: ''
          });
          $container.css({
            height: ''
          });
        },

        setting: function setting(name, value) {
          if ($.isPlainObject(name)) {
            $.extend(true, settings, name);
          } else if (value !== undefined) {
            settings[name] = value;
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
            module.performance.timer = setTimeout(module.performance.display, 0);
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

  $.fn.sticky.settings = {

    name: 'Sticky',
    namespace: 'sticky',

    silent: false,
    debug: false,
    verbose: true,
    performance: true,

    // whether to stick in the opposite direction on scroll up
    pushing: false,

    context: false,
    container: false,

    // Context to watch scroll events
    scrollContext: window,

    // Offset to adjust scroll
    offset: 0,

    // Offset to adjust scroll when attached to bottom of screen
    bottomOffset: 0,

    jitter: 5, // will only set container height if difference between context and container is larger than this number

    // Whether to automatically observe changes with Mutation Observers
    observeChanges: false,

    // Called when position is recalculated
    onReposition: function onReposition() {},

    // Called on each scroll
    onScroll: function onScroll() {},

    // Called when element is stuck to viewport
    onStick: function onStick() {},

    // Called when element is unstuck from viewport
    onUnstick: function onUnstick() {},

    // Called when element reaches top of context
    onTop: function onTop() {},

    // Called when element reaches bottom of context
    onBottom: function onBottom() {},

    error: {
      container: 'Sticky element must be inside a relative container',
      visible: 'Element is hidden, you must call refresh after element becomes visible. Use silent setting to surpress this warning in production.',
      method: 'The method you called is not defined.',
      invalidContext: 'Context specified does not exist',
      elementSize: 'Sticky element is larger than its container, cannot create sticky.'
    },

    className: {
      bound: 'bound',
      fixed: 'fixed',
      supported: 'native',
      top: 'top',
      bottom: 'bottom'
    }

  };
})(jQuery, window, document);