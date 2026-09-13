(() => {
  const selector = "[data-reveal]";
  const pendingClass = "reveal-pending";
  const visibleClass = "reveal-visible";
  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  let observer;

  const reveal = (element) => {
    element.classList.remove(pendingClass);
    element.classList.add(visibleClass);
    if (observer) observer.unobserve(element);
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

    observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && reveal(entry.target)), {
      rootMargin: "0px 0px -8%",
      threshold: 0,
    });

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(element);
      } else {
        element.classList.add(pendingClass);
        observer.observe(element);
      }
    });
  };

  document.addEventListener("focusin", (event) => {
    const element = event.target.closest ? event.target.closest(selector) : null;
    if (element) reveal(element);
  });
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", (event) => event.matches && revealAll());
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
