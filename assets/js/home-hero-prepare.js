(() => {
  try {
    const motionQuery = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery && motionQuery.matches) return;

    const root = document.documentElement;
    let timer;
    let state;

    const cleanup = () => {
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", monitorVisibility);
    };

    const failOpen = () => {
      state.expired = true;
      cleanup();
      root.classList.remove("home-hero-prepared");
    };

    const monitorVisibility = () => {
      if (timer) window.clearTimeout(timer);
      if (document.visibilityState === "visible") timer = window.setTimeout(failOpen, 2000);
    };

    root.classList.add("home-hero-prepared");
    state = { cleanup, expired: false, started: false };
    document.addEventListener("visibilitychange", monitorVisibility);
    monitorVisibility();
    window.homeHeroState = state;
  } catch (_) {
    document.documentElement.classList.remove("home-hero-prepared");
  }
})();
