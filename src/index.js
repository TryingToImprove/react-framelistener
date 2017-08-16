import ReactDOM from "react-dom";

let listenerFunctions = [];

const findOrAdd = context => {
  let setup = listenerFunctions.filter(
    listener => listener.context === context
  );

  if (setup.length) {
    return setup;
  }

  setup = {
    context,
    events: []
  };

  listenerFunctions.push(setup);

  return setup;
};

let isRunning = false;

const runner = timestamp => {
  ReactDOM.unstable_batchedUpdates(() => {
    listenerFunctions.forEach(setup => {
      setup.events.forEach(event => {
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

export const register = (context, func) => {
  const setup = findOrAdd(context);

  setup.events.push(func);

  if (!isRunning) {
    isRunning = true;
    requestAnimationFrame(runner);
  }
};

export const unregister = context => {
  for (let i = listenerFunctions.length - 1; i >= 0; i--) {
    if (listenerFunctions[i].context === context) {
      listenerFunctions.splice(i, 1);
    }
  }

  if (isRunning && listenerFunctions.length === 0) {
    isRunning = false;
  }
};
