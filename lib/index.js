"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unregister = exports.register = undefined;

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var listenerFunctions = [];

var findOrAdd = function findOrAdd(context) {
  var setup = listenerFunctions.filter(function (listener) {
    return listener.context === context;
  });

  if (setup.length) {
    return setup;
  }

  setup = {
    context: context,
    events: []
  };

  listenerFunctions.push(setup);

  return setup;
};

var isRunning = false;

var runner = function runner(timestamp) {
  _reactDom2.default.unstable_batchedUpdates(function () {
    listenerFunctions.forEach(function (setup) {
      setup.events.forEach(function (event) {
        try {
          event(timestamp);
        } catch (err) {
          console.warn("A FrameListener-error happend in ", setup.context);
          console.error(err);
        }
      });
    });
  });

  if (isRunning) {
    requestAnimationFrame(runner);
  }
};

var register = exports.register = function register(context, func) {
  var setup = findOrAdd(context);

  setup.events.push(func);

  if (!isRunning) {
    isRunning = true;
    requestAnimationFrame(runner);
  }
};

var unregister = exports.unregister = function unregister(context) {
  for (var i = listenerFunctions.length - 1; i >= 0; i--) {
    if (listenerFunctions[i].context === context) {
      listenerFunctions.splice(i, 1);
    }
  }

  if (isRunning && listenerFunctions.length === 0) {
    isRunning = false;
  }
};