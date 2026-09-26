const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const prepareSource = fs.readFileSync("assets/js/home-hero-prepare.js", "utf8");
const revealSource = fs.readFileSync("assets/js/reveal.js", "utf8");

function eventTarget() {
  const listeners = {};
  return {
    addEventListener(type, listener) {
      (listeners[type] || (listeners[type] = [])).push(listener);
    },
    removeEventListener(type, listener) {
      listeners[type] = (listeners[type] || []).filter((item) => item !== listener);
    },
    dispatch(type, event = {}) {
      (listeners[type] || []).slice().forEach((listener) => listener(event));
    },
  };
}

function environment({ reduced = false, visibility = "visible" } = {}) {
  const classes = new Set();
  const documentEvents = eventTarget();
  const windowEvents = eventTarget();
  const motionEvents = eventTarget();
  const timers = [];
  const frames = [];
  const motionQuery = Object.assign(motionEvents, { matches: reduced });
  const document = Object.assign(documentEvents, {
    documentElement: {
      classList: {
        add: (...names) => names.forEach((name) => classes.add(name)),
        contains: (name) => classes.has(name),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
      },
    },
    querySelectorAll: () => [],
    readyState: "complete",
    visibilityState: visibility,
  });
  const window = Object.assign(windowEvents, {
    clearTimeout: (timer) => {
      timer.cleared = true;
    },
    innerHeight: 800,
    matchMedia: () => motionQuery,
    requestAnimationFrame: (callback) => frames.push(callback),
    setTimeout: (callback) => {
      const timer = { callback, cleared: false };
      timers.push(timer);
      return timer;
    },
  });
  const context = vm.createContext({ document, window });
  return { classes, context, document, frames, motionQuery, timers, window };
}

test("reduced motion leaves the hero visible from the start", () => {
  const env = environment({ reduced: true });
  vm.runInContext(prepareSource, env.context);
  assert.equal(env.classes.has("home-hero-prepared"), false);
});

test("the hero starts once, only after the page becomes visible", () => {
  const env = environment({ visibility: "hidden" });
  vm.runInContext(prepareSource, env.context);
  assert.equal(env.timers.length, 0);
  vm.runInContext(revealSource, env.context);
  env.window.dispatch("pageshow");
  assert.equal(env.classes.has("home-hero-started"), false);
  env.document.visibilityState = "visible";
  env.document.dispatch("visibilitychange");
  assert.equal(env.classes.has("home-hero-started"), true);
  env.classes.delete("home-hero-started");
  env.window.dispatch("pageshow");
  assert.equal(env.classes.has("home-hero-started"), false);
});

test("a failed deferred script grants a fresh fail-open window after a hidden tab becomes visible", () => {
  const env = environment({ visibility: "hidden" });
  vm.runInContext(prepareSource, env.context);
  assert.equal(env.timers.length, 0);
  env.document.visibilityState = "visible";
  env.document.dispatch("visibilitychange");
  assert.equal(env.classes.has("home-hero-prepared"), true);
  assert.equal(env.timers.length, 1);
  env.timers[0].callback();
  assert.equal(env.classes.has("home-hero-prepared"), false);
});

test("a visible page starts on the next frame without waiting for pageshow", () => {
  const env = environment();
  vm.runInContext(prepareSource, env.context);
  vm.runInContext(revealSource, env.context);
  assert.equal(env.classes.has("home-hero-started"), false);
  env.frames[0]();
  assert.equal(env.classes.has("home-hero-started"), true);
});

test("a late pageshow cannot animate after preparation has failed open", () => {
  const env = environment();
  vm.runInContext(prepareSource, env.context);
  vm.runInContext(revealSource, env.context);
  env.timers[0].callback();
  env.window.dispatch("pageshow");
  assert.equal(env.classes.has("home-hero-prepared"), false);
  assert.equal(env.classes.has("home-hero-started"), false);
});

test("enabling reduced motion finishes a running hero immediately", () => {
  const env = environment();
  vm.runInContext(prepareSource, env.context);
  vm.runInContext(revealSource, env.context);
  env.window.dispatch("pageshow");
  env.motionQuery.matches = true;
  env.motionQuery.dispatch("change", { matches: true });
  assert.equal(env.classes.has("home-hero-prepared"), false);
  assert.equal(env.classes.has("home-hero-started"), false);
});

test("preparation fails open when the deferred lifecycle does not run", () => {
  const env = environment();
  vm.runInContext(prepareSource, env.context);
  env.timers[0].callback();
  assert.equal(env.classes.has("home-hero-prepared"), false);
});

function revealEnvironment(rects) {
  const env = environment();
  const observers = [];
  const elements = rects.map((rect) => {
    const classes = new Set();
    return {
      classes,
      classList: {
        add: (...names) => names.forEach((name) => classes.add(name)),
        contains: (name) => classes.has(name),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        toggle: (name, force) => (force ? classes.add(name) : classes.delete(name), force),
      },
      getBoundingClientRect: () => rect,
    };
  });
  class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.targets = new Set();
      observers.push(this);
    }
    observe(target) {
      this.targets.add(target);
    }
    unobserve(target) {
      this.targets.delete(target);
    }
    disconnect() {
      this.targets.clear();
    }
  }
  env.document.querySelectorAll = () => elements;
  env.window.IntersectionObserver = IntersectionObserver;
  env.context.IntersectionObserver = IntersectionObserver;
  vm.runInContext(revealSource, env.context);
  const observer = observers[0];
  const report = (target, isIntersecting, boundingClientRect) => observer.callback([{ target, isIntersecting, boundingClientRect }]);
  return { elements, observer, report };
}

const inView = { top: 300, bottom: 500 };
const belowFold = { top: 900, bottom: 1100 };
const aboveFold = { top: -300, bottom: -100 };

test("a revealed element replays after leaving the viewport entirely", () => {
  const { elements, observer, report } = revealEnvironment([inView, belowFold]);
  const [first, second] = elements;
  assert.equal(first.classes.has("reveal-visible"), true);
  assert.equal(observer.targets.has(first), true);
  assert.equal(second.classes.has("reveal-pending"), true);

  report(second, true, inView);
  assert.equal(second.classes.has("reveal-visible"), true);
  assert.equal(second.classes.has("reveal-pending"), false);

  report(second, false, belowFold);
  assert.equal(second.classes.has("reveal-visible"), false);
  assert.equal(second.classes.has("reveal-pending"), true);
  assert.equal(second.classes.has("reveal-above"), false);
  assert.equal(observer.targets.has(second), true);

  report(second, true, inView);
  assert.equal(second.classes.has("reveal-visible"), true);
  assert.equal(second.classes.has("reveal-pending"), false);
});

test("an element that leaves through the top waits above the viewport", () => {
  const { elements, report } = revealEnvironment([inView]);
  const [element] = elements;
  report(element, false, aboveFold);
  assert.equal(element.classes.has("reveal-pending"), true);
  assert.equal(element.classes.has("reveal-above"), true);

  report(element, true, inView);
  assert.equal(element.classes.has("reveal-visible"), true);
  assert.equal(element.classes.has("reveal-pending"), false);
  assert.equal(element.classes.has("reveal-above"), false);
});

test("an element in the trimmed bottom band stays revealed", () => {
  const { elements, report } = revealEnvironment([inView]);
  const [element] = elements;
  report(element, false, { top: 760, bottom: 960 });
  assert.equal(element.classes.has("reveal-visible"), true);
  assert.equal(element.classes.has("reveal-pending"), false);
});
