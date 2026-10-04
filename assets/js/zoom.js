// Full-screen lightbox for [data-zoomable] images: shows the whole, uncropped
// original, fitted to the viewport (thumbnails may be cropped by object-fit).
(() => {
  const MARGIN = 16; // px between the image and the viewport edge
  const CLOSE_ON_SCROLL = 40; // px of page scroll that dismisses the lightbox
  let active = null;

  const reducedMotion = () => Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // <img src> is the untouched original; the <picture> srcset holds downsized
  // variants. A matching media source (the reduced-motion still of a GIF
  // preview) wins so the lightbox doesn't start an animation the user opted out of.
  const fullSrc = (img) => {
    const picture = img.parentElement && img.parentElement.tagName === "PICTURE" ? img.parentElement : null;
    if (picture) {
      for (const source of picture.querySelectorAll("source[media]")) {
        if (window.matchMedia(source.media).matches) return source.getAttribute("srcset");
      }
    }
    return img.getAttribute("src");
  };

  // Largest box with the image's aspect ratio that fits inside the margins.
  const fit = (aspect) => {
    const maxW = document.documentElement.clientWidth - MARGIN * 2;
    const maxH = window.innerHeight - MARGIN * 2;
    const width = Math.min(maxW, maxH * aspect);
    return { width, height: width / aspect };
  };

  // Transform that lays the centered lightbox image over the thumbnail.
  const fromThumb = (img, size) => {
    const r = img.getBoundingClientRect();
    const dx = r.left + r.width / 2 - document.documentElement.clientWidth / 2;
    const dy = r.top + r.height / 2 - window.innerHeight / 2;
    return `translate(${dx}px, ${dy}px) scale(${r.width / size.width})`;
  };

  const open = (img) => {
    if (active) return;
    const rect = img.getBoundingClientRect();
    // naturalWidth/Height of the loaded variant carry the true (uncropped) ratio; SVGs may report 0.
    const aspect = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : rect.width / rect.height || 1;

    const overlay = document.createElement("div");
    overlay.className = "zoom-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", img.alt || "Enlarged image");
    overlay.tabIndex = -1;

    const big = document.createElement("img");
    big.className = "zoom-lightbox__img";
    big.alt = img.alt || "";
    big.decoding = "async";
    // Start from the already-decoded thumbnail so the lightbox appears instantly.
    big.src = img.currentSrc || img.src;
    overlay.appendChild(big);

    const size = fit(aspect);
    big.style.width = `${size.width}px`;
    big.style.height = `${size.height}px`;
    big.style.transform = fromThumb(img, size);
    document.body.appendChild(overlay);

    active = { img, overlay, big, aspect, scrollY: window.scrollY, returnFocus: document.activeElement };

    const src = fullSrc(img);
    if (src) {
      const hd = new Image();
      hd.onload = () => {
        if (active && active.big === big) big.src = hd.src;
      };
      hd.src = src;
    }

    overlay.getBoundingClientRect(); // commit the start pose before transitioning
    overlay.classList.add("zoom-lightbox--open");
    big.style.transform = "";
    overlay.focus({ preventScroll: true });
  };

  const close = () => {
    if (!active) return;
    const { img, overlay, big, aspect, returnFocus } = active;
    active = null;

    overlay.classList.remove("zoom-lightbox--open");
    big.style.transform = fromThumb(img, fit(aspect));
    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      overlay.remove();
    };
    if (reducedMotion()) remove();
    else {
      overlay.addEventListener("transitionend", (e) => e.target === overlay && remove());
      setTimeout(remove, 400); // in case transitionend never fires
    }
    if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
  };

  const refit = () => {
    if (!active) return;
    const size = fit(active.aspect);
    active.big.style.width = `${size.width}px`;
    active.big.style.height = `${size.height}px`;
  };

  document.addEventListener("click", (e) => {
    if (active) {
      if (active.overlay.contains(e.target)) close();
      return;
    }
    const img = e.target.closest && e.target.closest("img[data-zoomable]");
    if (!img) return;
    e.preventDefault();
    open(img);
  });

  document.addEventListener("keydown", (e) => {
    if (active && (e.key === "Escape" || e.key === "Esc")) close();
  });

  window.addEventListener(
    "scroll",
    () => {
      if (active && Math.abs(window.scrollY - active.scrollY) > CLOSE_ON_SCROLL) close();
    },
    { passive: true }
  );

  window.addEventListener("resize", refit, { passive: true });
})();
