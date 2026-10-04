(() => {
  const selector = "#travel-map";
  const dataSelector = "#travel-map-data";
  const livedClass = "travel-map__pin--lived";

  // Coalesce bursts of resize callbacks into one update per frame.
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

  const readPlaces = () => {
    const source = document.querySelector(dataSelector);
    if (!source) return [];
    const places = JSON.parse(source.textContent);
    return Array.isArray(places) ? places.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)) : [];
  };

  const init = () => {
    const container = document.querySelector(selector);
    if (!container || typeof window.jsVectorMap !== "function") return;
    // Visited first, so the lived pins paint on top where pins overlap.
    const places = readPlaces().sort((a, b) => Number(Boolean(a.lived)) - Number(Boolean(b.lived)));
    if (!places.length) return;

    // Colors come from CSS (theme variables), so pins and land follow the
    // light/dark toggle; jsVectorMap only sets SVG presentation attributes,
    // which any stylesheet rule overrides.
    const map = new window.jsVectorMap({
      selector,
      map: "world",
      zoomButtons: true,
      zoomOnScroll: false,
      markers: places.map((p) => ({
        name: p.years ? `${p.name} · ${p.years}` : p.name,
        coords: [p.lat, p.lng],
        style: { initial: { r: p.lived ? 6 : 5 } },
      })),
      // Tooltips only for pins; country names would be noise here.
      onRegionTooltipShow(event) {
        event.preventDefault();
      },
      onLoaded() {
        container.querySelectorAll(".jvm-marker").forEach((pin) => {
          const place = places[Number(pin.getAttribute("data-index"))];
          if (place && place.lived) pin.classList.add(livedClass);
        });
      },
    });

    // jsVectorMap 1.7 never re-measures its container on its own.
    if (window.ResizeObserver) {
      let width = container.offsetWidth;
      let height = container.offsetHeight;
      const resize = throttle(() => {
        if (container.offsetWidth === width && container.offsetHeight === height) return;
        width = container.offsetWidth;
        height = container.offsetHeight;
        if (width && height) map.updateSize();
      });
      new ResizeObserver(resize).observe(container);
    }
  };

  const safelyInit = () => {
    try {
      init();
    } catch (_) {
      // Without the map the legend still reads; nothing else depends on it.
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safelyInit, { once: true });
  else safelyInit();
})();
