'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * # Semantic UI 2.2.10 - Transition
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

  $.fn.transition = function () {
    var $allModules = $(this),
        moduleSelector = $allModules.selector || '',
        time = new Date().getTime(),
        performance = [],
        moduleArguments = arguments,
        query = moduleArguments[0],
        queryArguments = [].slice.call(arguments, 1),
        methodInvoked = typeof query === 'string',
        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
      setTimeout(callback, 0);
    },
        returnedValue;
    $allModules.each(function (index) {
      var $module = $(this),
          element = this,


      // set at run time
      settings,
          instance,
          error,
          className,
          metadata,
          animationEnd,
          animationName,
          namespace,
          moduleNamespace,
          eventNamespace,
          module;

      module = {

        initialize: function initialize() {

          // get full settings
          settings = module.get.settings.apply(element, moduleArguments);

          // shorthand
          className = settings.className;
          error = settings.error;
          metadata = settings.metadata;

          // define namespace
          eventNamespace = '.' + settings.namespace;
          moduleNamespace = 'module-' + settings.namespace;
          instance = $module.data(moduleNamespace) || module;

          // get vendor specific events
          animationEnd = module.get.animationEndEvent();

          if (methodInvoked) {
            methodInvoked = module.invoke(query);
          }

          // method not invoked, lets run an animation
          if (methodInvoked === false) {
            module.verbose('Converted arguments into settings object', settings);
            if (settings.interval) {
              module.delay(settings.animate);
            } else {
              module.animate();
            }
            module.instantiate();
          }
        },

        instantiate: function instantiate() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module.data(moduleNamespace, instance);
        },

        destroy: function destroy() {
          module.verbose('Destroying previous module for', element);
          $module.removeData(moduleNamespace);
        },

        refresh: function refresh() {
          module.verbose('Refreshing display type on next animation');
          delete module.displayType;
        },

        forceRepaint: function forceRepaint() {
          module.verbose('Forcing element repaint');
          var $parentElement = $module.parent(),
              $nextElement = $module.next();
          if ($nextElement.length === 0) {
            $module.detach().appendTo($parentElement);
          } else {
            $module.detach().insertBefore($nextElement);
          }
        },

        repaint: function repaint() {
          module.verbose('Repainting element');
          var fakeAssignment = element.offsetWidth;
        },

        delay: function delay(interval) {
          var direction = module.get.animationDirection(),
              shouldReverse,
              delay;
          if (!direction) {
            direction = module.can.transition() ? module.get.direction() : 'static';
          }
          interval = interval !== undefined ? interval : settings.interval;
          shouldReverse = settings.reverse == 'auto' && direction == className.outward;
          delay = shouldReverse || settings.reverse == true ? ($allModules.length - index) * settings.interval : index * settings.interval;
          module.debug('Delaying animation by', delay);
          setTimeout(module.animate, delay);
        },

        animate: function animate(overrideSettings) {
          settings = overrideSettings || settings;
          if (!module.is.supported()) {
            module.error(error.support);
            return false;
          }
          module.debug('Preparing animation', settings.animation);
          if (module.is.animating()) {
            if (settings.queue) {
              if (!settings.allowRepeats && module.has.direction() && module.is.occurring() && module.queuing !== true) {
                module.debug('Animation is currently occurring, preventing queueing same animation', settings.animation);
              } else {
                module.queue(settings.animation);
              }
              return false;
            } else if (!settings.allowRepeats && module.is.occurring()) {
              module.debug('Animation is already occurring, will not execute repeated animation', settings.animation);
              return false;
            } else {
              module.debug('New animation started, completing previous early', settings.animation);
              instance.complete();
            }
          }
          if (module.can.animate()) {
            module.set.animating(settings.animation);
          } else {
            module.error(error.noAnimation, settings.animation, element);
          }
        },

        reset: function reset() {
          module.debug('Resetting animation to beginning conditions');
          module.remove.animationCallbacks();
          module.restore.conditions();
          module.remove.animating();
        },

        queue: function queue(animation) {
          module.debug('Queueing animation of', animation);
          module.queuing = true;
          $module.one(animationEnd + '.queue' + eventNamespace, function () {
            module.queuing = false;
            module.repaint();
            module.animate.apply(this, settings);
          });
        },

        complete: function complete(event) {
          module.debug('Animation complete', settings.animation);
          module.remove.completeCallback();
          module.remove.failSafe();
          if (!module.is.looping()) {
            if (module.is.outward()) {
              module.verbose('Animation is outward, hiding element');
              module.restore.conditions();
              module.hide();
            } else if (module.is.inward()) {
              module.verbose('Animation is outward, showing element');
              module.restore.conditions();
              module.show();
            } else {
              module.verbose('Static animation completed');
              module.restore.conditions();
              settings.onComplete.call(element);
            }
          }
        },

        force: {
          visible: function visible() {
            var style = $module.attr('style'),
                userStyle = module.get.userStyle(),
                displayType = module.get.displayType(),
                overrideStyle = userStyle + 'display: ' + displayType + ' !important;',
                currentDisplay = $module.css('display'),
                emptyStyle = style === undefined || style === '';
            if (currentDisplay !== displayType) {
              module.verbose('Overriding default display to show element', displayType);
              $module.attr('style', overrideStyle);
            } else if (emptyStyle) {
              $module.removeAttr('style');
            }
          },
          hidden: function hidden() {
            var style = $module.attr('style'),
                currentDisplay = $module.css('display'),
                emptyStyle = style === undefined || style === '';
            if (currentDisplay !== 'none' && !module.is.hidden()) {
              module.verbose('Overriding default display to hide element');
              $module.css('display', 'none');
            } else if (emptyStyle) {
              $module.removeAttr('style');
            }
          }
        },

        has: {
          direction: function direction(animation) {
            var hasDirection = false;
            animation = animation || settings.animation;
            if (typeof animation === 'string') {
              animation = animation.split(' ');
              $.each(animation, function (index, word) {
                if (word === className.inward || word === className.outward) {
                  hasDirection = true;
                }
              });
            }
            return hasDirection;
          },
          inlineDisplay: function inlineDisplay() {
            var style = $module.attr('style') || '';
            return $.isArray(style.match(/display.*?;/, ''));
          }
        },

        set: {
          animating: function animating(animation) {
            var animationClass, direction;
            // remove previous callbacks
            module.remove.completeCallback();

            // determine exact animation
            animation = animation || settings.animation;
            animationClass = module.get.animationClass(animation);

            // save animation class in cache to restore class names
            module.save.animation(animationClass);

            // override display if necessary so animation appears visibly
            module.force.visible();

            module.remove.hidden();
            module.remove.direction();

            module.start.animation(animationClass);
          },
          duration: function duration(animationName, _duration) {
            _duration = _duration || settings.duration;
            _duration = typeof _duration == 'number' ? _duration + 'ms' : _duration;
            if (_duration || _duration === 0) {
              module.verbose('Setting animation duration', _duration);
              $module.css({
                'animation-duration': _duration
              });
            }
          },
          direction: function direction(_direction) {
            _direction = _direction || module.get.direction();
            if (_direction == className.inward) {
              module.set.inward();
            } else {
              module.set.outward();
            }
          },
          looping: function looping() {
            module.debug('Transition set to loop');
            $module.addClass(className.looping);
          },
          hidden: function hidden() {
            $module.addClass(className.transition).addClass(className.hidden);
          },
          inward: function inward() {
            module.debug('Setting direction to inward');
            $module.removeClass(className.outward).addClass(className.inward);
          },
          outward: function outward() {
            module.debug('Setting direction to outward');
            $module.removeClass(className.inward).addClass(className.outward);
          },
          visible: function visible() {
            $module.addClass(className.transition).addClass(className.visible);
          }
        },

        start: {
          animation: function animation(animationClass) {
            animationClass = animationClass || module.get.animationClass();
            module.debug('Starting tween', animationClass);
            $module.addClass(animationClass).one(animationEnd + '.complete' + eventNamespace, module.complete);
            if (settings.useFailSafe) {
              module.add.failSafe();
            }
            module.set.duration(settings.duration);
            settings.onStart.call(element);
          }
        },

        save: {
          animation: function animation(_animation) {
            if (!module.cache) {
              module.cache = {};
            }
            module.cache.animation = _animation;
          },
          displayType: function displayType(_displayType) {
            if (_displayType !== 'none') {
              $module.data(metadata.displayType, _displayType);
            }
          },
          transitionExists: function transitionExists(animation, exists) {
            $.fn.transition.exists[animation] = exists;
            module.verbose('Saving existence of transition', animation, exists);
          }
        },

        restore: {
          conditions: function conditions() {
            var animation = module.get.currentAnimation();
            if (animation) {
              $module.removeClass(animation);
              module.verbose('Removing animation class', module.cache);
            }
            module.remove.duration();
          }
        },

        add: {
          failSafe: function failSafe() {
            var duration = module.get.duration();
            module.timer = setTimeout(function () {
              $module.triggerHandler(animationEnd);
            }, duration + settings.failSafeDelay);
            module.verbose('Adding fail safe timer', module.timer);
          }
        },

        remove: {
          animating: function animating() {
            $module.removeClass(className.animating);
          },
          animationCallbacks: function animationCallbacks() {
            module.remove.queueCallback();
            module.remove.completeCallback();
          },
          queueCallback: function queueCallback() {
            $module.off('.queue' + eventNamespace);
          },
          completeCallback: function completeCallback() {
            $module.off('.complete' + eventNamespace);
          },
          display: function display() {
            $module.css('display', '');
          },
          direction: function direction() {
            $module.removeClass(className.inward).removeClass(className.outward);
          },
          duration: function duration() {
            $module.css('animation-duration', '');
          },
          failSafe: function failSafe() {
            module.verbose('Removing fail safe timer', module.timer);
            if (module.timer) {
              clearTimeout(module.timer);
            }
          },
          hidden: function hidden() {
            $module.removeClass(className.hidden);
          },
          visible: function visible() {
            $module.removeClass(className.visible);
          },
          looping: function looping() {
            module.debug('Transitions are no longer looping');
            if (module.is.looping()) {
              module.reset();
              $module.removeClass(className.looping);
            }
          },
          transition: function transition() {
            $module.removeClass(className.visible).removeClass(className.hidden);
          }
        },
        get: {
          settings: function settings(animation, duration, onComplete) {
            // single settings object
            if ((typeof animation === 'undefined' ? 'undefined' : _typeof(animation)) == 'object') {
              return $.extend(true, {}, $.fn.transition.settings, animation);
            }
            // all arguments provided
            else if (typeof onComplete == 'function') {
                return $.extend({}, $.fn.transition.settings, {
                  animation: animation,
                  onComplete: onComplete,
                  duration: duration
                });
              }
              // only duration provided
              else if (typeof duration == 'string' || typeof duration == 'number') {
                  return $.extend({}, $.fn.transition.settings, {
                    animation: animation,
                    duration: duration
                  });
                }
                // duration is actually settings object
                else if ((typeof duration === 'undefined' ? 'undefined' : _typeof(duration)) == 'object') {
                    return $.extend({}, $.fn.transition.settings, duration, {
                      animation: animation
                    });
                  }
                  // duration is actually callback
                  else if (typeof duration == 'function') {
                      return $.extend({}, $.fn.transition.settings, {
                        animation: animation,
                        onComplete: duration
                      });
                    }
                    // only animation provided
                    else {
                        return $.extend({}, $.fn.transition.settings, {
                          animation: animation
                        });
                      }
          },
          animationClass: function animationClass(animation) {
            var animationClass = animation || settings.animation,
                directionClass = module.can.transition() && !module.has.direction() ? module.get.direction() + ' ' : '';
            return className.animating + ' ' + className.transition + ' ' + directionClass + animationClass;
          },
          currentAnimation: function currentAnimation() {
            return module.cache && module.cache.animation !== undefined ? module.cache.animation : false;
          },
          currentDirection: function currentDirection() {
            return module.is.inward() ? className.inward : className.outward;
          },
          direction: function direction() {
            return module.is.hidden() || !module.is.visible() ? className.inward : className.outward;
          },
          animationDirection: function animationDirection(animation) {
            var direction;
            animation = animation || settings.animation;
            if (typeof animation === 'string') {
              animation = animation.split(' ');
              // search animation name for out/in class
              $.each(animation, function (index, word) {
                if (word === className.inward) {
                  direction = className.inward;
                } else if (word === className.outward) {
                  direction = className.outward;
                }
              });
            }
            // return found direction
            if (direction) {
              return direction;
            }
            return false;
          },
          duration: function duration(_duration2) {
            _duration2 = _duration2 || settings.duration;
            if (_duration2 === false) {
              _duration2 = $module.css('animation-duration') || 0;
            }
            return typeof _duration2 === 'string' ? _duration2.indexOf('ms') > -1 ? parseFloat(_duration2) : parseFloat(_duration2) * 1000 : _duration2;
          },
          displayType: function displayType(shouldDetermine) {
            shouldDetermine = shouldDetermine !== undefined ? shouldDetermine : true;
            if (settings.displayType) {
              return settings.displayType;
            }
            if (shouldDetermine && $module.data(metadata.displayType) === undefined) {
              // create fake element to determine display state
              module.can.transition(true);
            }
            return $module.data(metadata.displayType);
          },
          userStyle: function userStyle(style) {
            style = style || $module.attr('style') || '';
            return style.replace(/display.*?;/, '');
          },
          transitionExists: function transitionExists(animation) {
            return $.fn.transition.exists[animation];
          },
          animationStartEvent: function animationStartEvent() {
            var element = document.createElement('div'),
                animations = {
              'animation': 'animationstart',
              'OAnimation': 'oAnimationStart',
              'MozAnimation': 'mozAnimationStart',
              'WebkitAnimation': 'webkitAnimationStart'
            },
                animation;
            for (animation in animations) {
              if (element.style[animation] !== undefined) {
                return animations[animation];
              }
            }
            return false;
          },
          animationEndEvent: function animationEndEvent() {
            var element = document.createElement('div'),
                animations = {
              'animation': 'animationend',
              'OAnimation': 'oAnimationEnd',
              'MozAnimation': 'mozAnimationEnd',
              'WebkitAnimation': 'webkitAnimationEnd'
            },
                animation;
            for (animation in animations) {
              if (element.style[animation] !== undefined) {
                return animations[animation];
              }
            }
            return false;
          }

        },

        can: {
          transition: function transition(forced) {
            var animation = settings.animation,
                transitionExists = module.get.transitionExists(animation),
                displayType = module.get.displayType(false),
                elementClass,
                tagName,
                $clone,
                currentAnimation,
                inAnimation,
                directionExists;
            if (transitionExists === undefined || forced) {
              module.verbose('Determining whether animation exists');
              elementClass = $module.attr('class');
              tagName = $module.prop('tagName');

              $clone = $('<' + tagName + ' />').addClass(elementClass).insertAfter($module);
              currentAnimation = $clone.addClass(animation).removeClass(className.inward).removeClass(className.outward).addClass(className.animating).addClass(className.transition).css('animationName');
              inAnimation = $clone.addClass(className.inward).css('animationName');
              if (!displayType) {
                displayType = $clone.attr('class', elementClass).removeAttr('style').removeClass(className.hidden).removeClass(className.visible).show().css('display');
                module.verbose('Determining final display state', displayType);
                module.save.displayType(displayType);
              }

              $clone.remove();
              if (currentAnimation != inAnimation) {
                module.debug('Direction exists for animation', animation);
                directionExists = true;
              } else if (currentAnimation == 'none' || !currentAnimation) {
                module.debug('No animation defined in css', animation);
                return;
              } else {
                module.debug('Static animation found', animation, displayType);
                directionExists = false;
              }
              module.save.transitionExists(animation, directionExists);
            }
            return transitionExists !== undefined ? transitionExists : directionExists;
          },
          animate: function animate() {
            // can transition does not return a value if animation does not exist
            return module.can.transition() !== undefined;
          }
        },

        is: {
          animating: function animating() {
            return $module.hasClass(className.animating);
          },
          inward: function inward() {
            return $module.hasClass(className.inward);
          },
          outward: function outward() {
            return $module.hasClass(className.outward);
          },
          looping: function looping() {
            return $module.hasClass(className.looping);
          },
          occurring: function occurring(animation) {
            animation = animation || settings.animation;
            animation = '.' + animation.replace(' ', '.');
            return $module.filter(animation).length > 0;
          },
          visible: function visible() {
            return $module.is(':visible');
          },
          hidden: function hidden() {
            return $module.css('visibility') === 'hidden';
          },
          supported: function supported() {
            return animationEnd !== false;
          }
        },

        hide: function hide() {
          module.verbose('Hiding element');
          if (module.is.animating()) {
            module.reset();
          }
          element.blur(); // IE will trigger focus change if element is not blurred before hiding
          module.remove.display();
          module.remove.visible();
          module.set.hidden();
          module.force.hidden();
          settings.onHide.call(element);
          settings.onComplete.call(element);
          // module.repaint();
        },

        show: function show(display) {
          module.verbose('Showing element', display);
          module.remove.hidden();
          module.set.visible();
          module.force.visible();
          settings.onShow.call(element);
          settings.onComplete.call(element);
          // module.repaint();
        },

        toggle: function toggle() {
          if (module.is.visible()) {
            module.hide();
          } else {
            module.show();
          }
        },

        stop: function stop() {
          module.debug('Stopping current animation');
          $module.triggerHandler(animationEnd);
        },

        stopAll: function stopAll() {
          module.debug('Stopping all animation');
          module.remove.queueCallback();
          $module.triggerHandler(animationEnd);
        },

        clear: {
          queue: function queue() {
            module.debug('Clearing animation queue');
            module.remove.queueCallback();
          }
        },

        enable: function enable() {
          module.verbose('Starting animation');
          $module.removeClass(className.disabled);
        },

        disable: function disable() {
          module.debug('Stopping animation');
          $module.addClass(className.disabled);
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
        // modified for transition to return invoke success
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
          return found !== undefined ? found : false;
        }
      };
      module.initialize();
    });
    return returnedValue !== undefined ? returnedValue : this;
  };

  // Records if CSS transition is available
  $.fn.transition.exists = {};

  $.fn.transition.settings = {

    // module info
    name: 'Transition',

    // hide all output from this component regardless of other settings
    silent: false,

    // debug content outputted to console
    debug: false,

    // verbose debug output
    verbose: false,

    // performance data output
    performance: true,

    // event namespace
    namespace: 'transition',

    // delay between animations in group
    interval: 0,

    // whether group animations should be reversed
    reverse: 'auto',

    // animation callback event
    onStart: function onStart() {},
    onComplete: function onComplete() {},
    onShow: function onShow() {},
    onHide: function onHide() {},

    // whether timeout should be used to ensure callback fires in cases animationend does not
    useFailSafe: true,

    // delay in ms for fail safe
    failSafeDelay: 100,

    // whether EXACT animation can occur twice in a row
    allowRepeats: false,

    // Override final display type on visible
    displayType: false,

    // animation duration
    animation: 'fade',
    duration: false,

    // new animations will occur after previous ones
    queue: true,

    metadata: {
      displayType: 'display'
    },

    className: {
      animating: 'animating',
      disabled: 'disabled',
      hidden: 'hidden',
      inward: 'in',
      loading: 'loading',
      looping: 'looping',
      outward: 'out',
      transition: 'transition',
      visible: 'visible'
    },

    // possible errors
    error: {
      noAnimation: 'Element is no longer attached to DOM. Unable to animate.  Use silent setting to surpress this warning in production.',
      repeated: 'That animation is already occurring, cancelling repeated animation',
      method: 'The method you called is not defined',
      support: 'This browser does not support CSS animations'
    }

  };
})(jQuery, window, document);