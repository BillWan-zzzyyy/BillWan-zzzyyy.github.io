(() => {
  const selector = "[data-reveal]";
  const pendingClass = "reveal-pending";
  const visibleClass = "reveal-visible";
  const aboveClass = "reveal-above";
  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  let observer;
  const heroState = window.homeHeroState;

  const finishHero = () => {
    if (!heroState) return;
    heroState.started = true;
    heroState.cleanup();
    document.documentElement.classList.remove("home-hero-prepared");
    document.documentElement.classList.remove("home-hero-started");
  };

  const startHero = () => {
    if (!heroState || heroState.started || document.visibilityState !== "visible") return;
    if (motionQuery.matches || heroState.expired) {
      finishHero();
      return;
    }
    heroState.started = true;
    heroState.cleanup();
    document.documentElement.classList.add("home-hero-started");
  };

  const reveal = (element) => {
    element.classList.remove(pendingClass, aboveClass);
    element.classList.add(visibleClass);
  };

  // Re-arm an element that is entirely off-screen so its next entrance animates
  // again; dropping .reveal-visible drops the transition, so the reset is never
  // seen. The pending offset points away from the edge the element left through:
  // pointing back toward it could push the element into view and loop.
  const conceal = (element, above) => {
    element.classList.remove(visibleClass);
    element.classList.add(pendingClass);
    element.classList.toggle(aboveClass, above);
  };

  const revealAll = () => {
    document.querySelectorAll(selector).forEach(reveal);
    if (observer) observer.disconnect();
    observer = undefined;
  };

  const init = () => {
    const elements = [...document.querySelectorAll(selector)];
    if (!elements.length || motionQuery.matches || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    // Only a rect wholly outside the viewport re-arms: an element in the bottom
    // band that rootMargin trims is still on screen and must not flicker.
    observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting, boundingClientRect: rect }) => {
          if (isIntersecting) reveal(target);
          else if (rect.bottom <= 0) conceal(target, true);
          else if (rect.top >= window.innerHeight) conceal(target, false);
        }),
      {
        rootMargin: "0px 0px -8%",
        threshold: 0,
      }
    );

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) reveal(element);
      else conceal(element, rect.bottom <= 0);
      observer.observe(element);
    });
  };

  document.addEventListener("focusin", (event) => {
    const element = event.target.closest ? event.target.closest(selector) : null;
    if (element) reveal(element);
  });
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", (event) => {
      if (event.matches) {
        finishHero();
        revealAll();
      }
    });
  }

  window.addEventListener("pageshow", startHero);
  document.addEventListener("visibilitychange", startHero);
  if (document.visibilityState === "visible") {
    if (window.requestAnimationFrame) window.requestAnimationFrame(startHero);
    else startHero();
  }

  const safelyInit = () => {
    try {
      init();
    } catch (_) {
      revealAll();
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safelyInit, { once: true });
  else safelyInit();
})();
