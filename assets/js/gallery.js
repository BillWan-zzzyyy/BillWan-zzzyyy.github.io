(() => {
  const selector = ".gallery";
  const staticClass = "gallery--static";
  const updaters = [];

  const reducedMotion = () => Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Coalesce bursts of scroll / resize events into one update per frame.
  const throttle = (callback) => {
    let queued = false;
    const run = () => {
      queued = false;
      callback();
    };
    return () => {
      if (queued) return;
      queued = true;
      if (window.requestAnimationFrame) window.requestAnimationFrame(run);
      else run();
    };
  };

  const setup = (gallery) => {
    const track = gallery.querySelector(".gallery__track");
    if (!track) return;
    const buttons = [...gallery.querySelectorAll(".gallery__btn")];

    // One card plus the column gap, so each click lands on the next snap point.
    const step = () => {
      const card = track.querySelector(".gallery__card");
      const width = card ? card.getBoundingClientRect().width : track.clientWidth;
      const gap = parseFloat(window.getComputedStyle(track).columnGap);
      return width + (Number.isFinite(gap) ? gap : 20);
    };

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      const atStart = scrollLeft <= 1;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
      buttons.forEach((button) => {
        button.disabled = Number(button.getAttribute("data-dir")) < 0 ? atStart : atEnd;
      });
      gallery.classList.toggle(staticClass, scrollWidth <= clientWidth + 1);
    };
    const scheduleUpdate = throttle(update);

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const dir = Number(button.getAttribute("data-dir")) || 0;
        track.scrollBy({ left: dir * step(), behavior: reducedMotion() ? "auto" : "smooth" });
      });
    });

    track.addEventListener("scroll", scheduleUpdate, { passive: true });
    track.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", scheduleUpdate, { once: true });
    });
    updaters.push(update);
    update();
  };

  const init = () => {
    document.querySelectorAll(selector).forEach((gallery) => {
      try {
        setup(gallery);
      } catch (_) {
        // Arrows without handlers would be dead controls; the track still scrolls natively.
        gallery.classList.add(staticClass);
      }
    });
    if (!updaters.length) return;
    const updateAll = throttle(() => updaters.forEach((update) => update()));
    window.addEventListener("resize", updateAll, { passive: true });
  };

  const safelyInit = () => {
    try {
      init();
    } catch (_) {
      // Leave the native scroll tracks untouched.
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safelyInit, { once: true });
  else safelyInit();
})();
