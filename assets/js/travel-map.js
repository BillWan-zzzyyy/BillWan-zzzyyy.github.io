(() => {
  const selector = "#travel-map";
  const dataSelector = "#travel-map-data";
  const svgNS = "http://www.w3.org/2000/svg";
  const livedClass = "travel-map__pin--lived";
  const haloClass = "travel-map__halo";
  const livedHaloClass = "travel-map__halo--lived";
  const visitedCountryClass = "travel-map__country--visited";
  // Matches the --travel-c1 … --travel-c8 palette in _sass/_base.scss; countries
  // take colors in order of first appearance and wrap around after the eighth.
  const paletteSize = 8;
  const pulseSeconds = 3.2;
  // Taiwan is shown as part of China: it shares China's color and is named to match.
  const colorGroups = { TW: "CN" };
  const regionLabels = { TW: "Taiwan, China" };

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

  // ISO-2 codes of visited countries, in front-matter order (which fixes their colors).
  const visitedCountries = (places) => {
    const codes = places.map((p) => String(p.country || "").toUpperCase()).filter((code) => /^[A-Z]{2}$/.test(code));
    return [...new Set(codes)];
  };

  const paintCountries = (container, countries) => {
    const groupOf = (code) => colorGroups[code] || code;
    const groups = [...new Set(countries.map(groupOf))];
    countries.forEach((code) => {
      const region = container.querySelector(`.jvm-region[data-code="${code}"]`);
      if (!region) return;
      region.classList.add(visitedCountryClass);
      region.style.setProperty("--travel-fill", `var(--travel-c${(groups.indexOf(groupOf(code)) % paletteSize) + 1})`);
    });
  };

  // A pulsing halo under each pin. jsVectorMap moves pins by rewriting their
  // cx/cy on every zoom/pan frame, so an observer mirrors those onto the halos.
  const addHalos = (container) => {
    const pins = [...container.querySelectorAll(".jvm-marker")];
    if (!pins.length) return;
    const group = pins[0].parentNode;
    const halos = new Map();
    const sync = (pin) => {
      const halo = halos.get(pin);
      if (!halo) return;
      ["cx", "cy", "r"].forEach((attr) => halo.setAttribute(attr, pin.getAttribute(attr)));
    };
    pins.forEach((pin, i) => {
      const halo = document.createElementNS(svgNS, "circle");
      halo.setAttribute("class", pin.classList.contains(livedClass) ? `${haloClass} ${livedHaloClass}` : haloClass);
      halo.setAttribute("aria-hidden", "true");
      // Spread the pulses over the cycle so they never beat in unison.
      halo.style.animationDelay = `${-((i * 0.618 * pulseSeconds) % pulseSeconds).toFixed(2)}s`;
      halos.set(pin, halo);
      sync(pin);
    });
    // All halos sit beneath all pins.
    group.prepend(...halos.values());
    if (window.MutationObserver) {
      new MutationObserver((records) => records.forEach((record) => sync(record.target))).observe(group, {
        attributes: true,
        attributeFilter: ["cx", "cy", "r"],
        subtree: true,
      });
    }
  };

  const init = () => {
    const container = document.querySelector(selector);
    if (!container || typeof window.jsVectorMap !== "function") return;
    const allPlaces = readPlaces();
    const countries = visitedCountries(allPlaces);
    // Visited first, so the lived pins paint on top where pins overlap.
    const places = allPlaces.slice().sort((a, b) => Number(Boolean(a.lived)) - Number(Boolean(b.lived)));
    if (!places.length) return;

    // Colors come from CSS (theme variables), so land, pins and halos follow the
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
        style: { initial: { r: p.lived ? 6 : 4.5 } },
      })),
      // Name only the countries I've been to; the rest stay quiet.
      onRegionTooltipShow(event, tooltip, code) {
        if (!countries.includes(code)) event.preventDefault();
        else if (regionLabels[code]) tooltip.text(regionLabels[code]);
      },
      onLoaded() {
        container.querySelectorAll(".jvm-marker").forEach((pin) => {
          const place = places[Number(pin.getAttribute("data-index"))];
          if (place && place.lived) pin.classList.add(livedClass);
        });
        paintCountries(container, countries);
        addHalos(container);
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
