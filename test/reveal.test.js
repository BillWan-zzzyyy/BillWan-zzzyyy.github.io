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
