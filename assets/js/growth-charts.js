// Publications page growth cards: draws cumulative citation / GitHub star
// curves from the #growth-data JSON emitted by _pages/publications.md.
(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const NO_CHART_CLASS = "growth-card--no-chart";
  const DAY_MS = 86400000;
  const VIEW_W = 100;
  const VIEW_H = 40;
  const PAD_TOP = 3;
  const PAD_BOTTOM = 1;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const STOPS = [
    ["0", "var(--ai-c1, #0894ff)"],
    ["0.34", "var(--ai-c2, #c959dd)"],
    ["0.68", "var(--ai-c3, #ff2e54)"],
    ["1", "var(--ai-c4, #ff9004)"],
  ];

  // --- Pure helpers: series + geometry (no DOM) ---------------------------

  const toNumber = (value) => (value === null || value === undefined || value === "" ? NaN : Number(value));

  const parseDay = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ""));
    return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : NaN;
  };

  const todayUtc = (now) => Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const monthLabel = (time) => {
    const date = new Date(time);
    return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };

  // Sort by time, drop invalid points, merge same-day points (later one wins).
  const normalize = (points) => {
    const merged = [];
    points
      .filter((point) => Number.isFinite(point.t) && Number.isFinite(point.v))
      .sort((a, b) => a.t - b.t)
      .forEach((point) => {
        const last = merged[merged.length - 1];
        if (last && point.t <= last.t) last.v = point.v;
        else merged.push({ t: point.t, v: point.v });
      });
    return merged;
  };

  // Per-year (non-cumulative) Scholar counts -> cumulative curve from Jan 1 of
  // the first year to today. A larger reported total (Scholar lag) wins at the end.
  const citationSeries = (perYear, total, today) => {
    if (!perYear || typeof perYear !== "object" || Array.isArray(perYear)) return null;
    const years = Object.keys(perYear)
      .map(Number)
      .filter((year) => Number.isInteger(year) && year > 1900);
    if (!years.length) return null;
    const first = Math.min(...years);
    const currentYear = new Date(today).getUTCFullYear();
    const last = Math.max(Math.max(...years), currentYear);
    const points = [{ t: Date.UTC(first, 0, 1), v: 0 }];
    let sum = 0;
    for (let year = first; year <= last; year += 1) {
      const count = toNumber(perYear[year]);
      sum += Number.isFinite(count) && count > 0 ? count : 0;
      points.push({ t: year >= currentYear ? today : Date.UTC(year, 11, 31), v: sum });
    }
    const series = normalize(points);
    if (series.length < 2) return null;
    const end = series[series.length - 1];
    const reported = toNumber(total);
    if (Number.isFinite(reported) && reported > end.v) end.v = reported;
    return { points: series, start: String(first), end: String(new Date(end.t).getUTCFullYear()) };
  };

  // Dated cumulative star totals -> curve starting at 0 the day before the
  // first record and ending today at the reported total.
  const starSeries = (history, total, today) => {
    if (!Array.isArray(history)) return null;
    const rows = normalize(history.map((row) => ({ t: parseDay(row && row.date), v: toNumber(row && row.stars) })));
    if (!rows.length) return null;
    const lastRow = rows[rows.length - 1];
    const reported = toNumber(total);
    const points = normalize([
      { t: rows[0].t - DAY_MS, v: 0 },
      ...rows,
      { t: Math.max(today, lastRow.t), v: Number.isFinite(reported) ? reported : lastRow.v },
    ]);
    if (points.length < 2) return null;
    return { points, start: monthLabel(rows[0].t), end: monthLabel(points[points.length - 1].t) };
  };

  // Map {t, v} into the 100x40 viewBox; y runs from 0 (bottom) to the max value.
  const project = (points) => {
    const t0 = points[0].t;
    const span = points[points.length - 1].t - t0 || 1;
    const max = Math.max(1, ...points.map((point) => point.v));
    const height = VIEW_H - PAD_TOP - PAD_BOTTOM;
    return points.map((point) => ({
      x: ((point.t - t0) / span) * VIEW_W,
      y: VIEW_H - PAD_BOTTOM - (Math.max(0, point.v) / max) * height,
    }));
  };

  const fmt = (value) => String(Math.round(value * 1000) / 1000);

  // Monotone cubic interpolation (Fritsch–Carlson): smooth, never overshoots.
  const monotonePath = (pts) => {
    const n = pts.length;
    if (n < 2) return "";
    const h = [];
    const d = [];
    for (let i = 0; i < n - 1; i += 1) {
      h[i] = pts[i + 1].x - pts[i].x;
      d[i] = h[i] > 0 ? (pts[i + 1].y - pts[i].y) / h[i] : 0;
    }
    const m = new Array(n);
    m[0] = d[0];
    m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i += 1) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i += 1) {
      if (d[i] === 0) {
        m[i] = 0;
        m[i + 1] = 0;
      } else {
        const a = m[i] / d[i];
        const b = m[i + 1] / d[i];
        const s = a * a + b * b;
        if (s > 9) {
          const tau = 3 / Math.sqrt(s);
          m[i] = tau * a * d[i];
          m[i + 1] = tau * b * d[i];
        }
      }
    }
    let path = `M${fmt(pts[0].x)},${fmt(pts[0].y)}`;
    for (let i = 0; i < n - 1; i += 1) {
      const third = h[i] / 3;
      path +=
        `C${fmt(pts[i].x + third)},${fmt(pts[i].y + m[i] * third)} ` +
        `${fmt(pts[i + 1].x - third)},${fmt(pts[i + 1].y - m[i + 1] * third)} ` +
        `${fmt(pts[i + 1].x)},${fmt(pts[i + 1].y)}`;
    }
    return path;
  };

  // --- DOM ------------------------------------------------------------------

  const svgEl = (name, attrs) => {
    const element = document.createElementNS(SVG_NS, name);
    Object.keys(attrs).forEach((key) => element.setAttribute(key, String(attrs[key])));
    return element;
  };

  const render = (svg, series, id) => {
    const pts = project(series.points);
    const line = monotonePath(pts);
    const area = `${line}L${fmt(pts[pts.length - 1].x)},${VIEW_H}L${fmt(pts[0].x)},${VIEW_H}Z`;

    const stroke = svgEl("linearGradient", { id: `${id}-stroke`, gradientUnits: "userSpaceOnUse", x1: 0, y1: 0, x2: VIEW_W, y2: 0 });
    STOPS.forEach(([offset, color]) => stroke.appendChild(svgEl("stop", { offset, style: `stop-color: ${color}` })));
    const fade = svgEl("linearGradient", { id: `${id}-fade`, gradientUnits: "userSpaceOnUse", x1: 0, y1: PAD_TOP, x2: 0, y2: VIEW_H });
    fade.appendChild(svgEl("stop", { offset: 0, "stop-color": "#fff", "stop-opacity": 0.26 }));
    fade.appendChild(svgEl("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": 0 }));
    const mask = svgEl("mask", { id: `${id}-mask`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: VIEW_W, height: VIEW_H });
    mask.appendChild(svgEl("rect", { x: 0, y: 0, width: VIEW_W, height: VIEW_H, fill: `url(#${id}-fade)` }));
    const defs = svgEl("defs", {});
    defs.appendChild(stroke);
    defs.appendChild(fade);
    defs.appendChild(mask);

    svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("focusable", "false");
    svg.appendChild(defs);
    svg.appendChild(svgEl("path", { d: area, fill: `url(#${id}-stroke)`, mask: `url(#${id}-mask)` }));
    svg.appendChild(
      svgEl("path", {
        d: line,
        fill: "none",
        stroke: `url(#${id}-stroke)`,
        "stroke-width": 2.5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "vector-effect": "non-scaling-stroke",
      })
    );
  };

  const readData = () => {
    const source = document.getElementById("growth-data");
    try {
      return (source && JSON.parse(source.textContent)) || {};
    } catch (_) {
      return {};
    }
  };

  const init = () => {
    const charts = document.querySelectorAll(".growth-card__chart[data-series]");
    if (!charts.length) return;
    const data = readData();
    const today = todayUtc(new Date());
    const builders = {
      citations: () => citationSeries(data.citations, data.citationsTotal, today),
      stars: () => starSeries(data.stars, data.starsTotal, today),
    };

    Array.prototype.forEach.call(charts, (svg, index) => {
      const name = svg.getAttribute("data-series");
      const card = (svg.closest && svg.closest(".growth-card")) || svg.parentNode;
      try {
        const series = builders[name] ? builders[name]() : null;
        if (!series || series.points.length < 2) throw new Error("growth-charts: not enough data");
        render(svg, series, `growth-${name}-${index}`);
        const labels = card.querySelectorAll(".growth-card__axis span");
        if (labels.length >= 2) {
          labels[0].textContent = series.start;
          labels[labels.length - 1].textContent = series.end;
        }
      } catch (_) {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        if (card && card.classList) card.classList.add(NO_CHART_CLASS);
      }
    });
  };

  const safelyInit = () => {
    try {
      init();
    } catch (_) {
      // Charts are decorative; the totals stay readable without them.
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safelyInit, { once: true });
  else safelyInit();
})();
