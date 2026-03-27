class AnalogClockHTML extends HTMLElement {
  set hass(hass) {
    if (this.content) return;

    console.info("%c ANALOG-CLOCK-HTML v1.8 ", "color: primary-text-color; font-weight: 400; background: transparent");

    const host = this;
    const config = this.config || {};

    // --- default colors ---
    let color_Background = "rgba(0, 0, 0, 0)";
    let color_Ticks = "var(--primary-text-color)";
    let hide_MinorTicks = false;
    let hide_MajorTicks = false;
    let color_FaceDigits = "var(--primary-text-color)";
    let locale = hass.language || "en-US";
    let color_DigitalTime = "var(--primary-text-color)";
    let color_HourHand = "rgba(0, 0, 0, 0)";
    let color_MinuteHand = "rgba(0, 0, 0, 0)";
    let color_SecondHand = "var(--primary-text-color)";
    let color_Text = "var(--primary-text-color)";
    let hide_FaceDigits = false;
    let hide_Date = false;
    let hide_WeekDay = false;
    let hide_DigitalTime = false;
    let hide_SecondHand = false;
    let dateMask = "";
    let timeFormat = "";
    let demo = false;

    // --- diameter parsing ---
    const minSize = 100, maxSize = 2000;
    let fixedPx = null;

    if (config.diameter !== undefined && config.diameter !== null) {
      const d = config.diameter;
      if (typeof d === "number") {
        fixedPx = Math.max(minSize, Math.min(d, maxSize));
      } else if (typeof d === "string") {
        const m = d.trim().match(/^(\d+)(px)?$/);
        if (m) fixedPx = Math.max(minSize, Math.min(parseInt(m[1], 10), maxSize));
      }
    }

    const clockSize = fixedPx || 220;

    // --- build DOM ---
    const card = document.createElement("ha-card");
    const content = document.createElement("div");
    content.style.cssText = "display:flex;justify-content:center;padding:5px;";

    const clock = document.createElement("div");
    clock.className = "clock-face";
    clock.style.cssText = `position:relative;width:${clockSize}px;height:${clockSize}px;`;

    // SVG: viewBox="-100 -100 200 200", center at (0,0)
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "-100 -100 200 200");
    svg.setAttribute("width", clockSize);
    svg.setAttribute("height", clockSize);
    svg.style.cssText = "position:absolute;top:0;left:0;overflow:visible;";

    const face = document.createElementNS(svgNS, "circle");
    face.setAttribute("cx", "0");
    face.setAttribute("cy", "0");
    face.setAttribute("r", "96");
    face.setAttribute("fill", "none");
    svg.appendChild(face);

    const ticksGroup = document.createElementNS(svgNS, "g");
    svg.appendChild(ticksGroup);

    const hourHand = document.createElementNS(svgNS, "polygon");
    hourHand.setAttribute("stroke", "none");
    svg.appendChild(hourHand);

    const minHand = document.createElementNS(svgNS, "polygon");
    minHand.setAttribute("stroke", "none");
    svg.appendChild(minHand);

    const secHand = document.createElementNS(svgNS, "polygon");
    secHand.setAttribute("stroke", "none");
    svg.appendChild(secHand);

    // Text overlay
    const textOverlay = document.createElement("div");
    textOverlay.style.cssText = `
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none; z-index: 10;
    `;

    const timeTopPct = 35, weekdayTopPct = 60, dateTopPct = 70;
    const timeFontSize = Math.round(clockSize * 0.16);
    const smallFontSize = Math.round(clockSize * 0.07);

    const digitalTime = document.createElement("div");
    digitalTime.style.cssText = `
      position: absolute; top: ${timeTopPct}%; left: 50%;
      transform: translateX(-50%) translateY(-50%);
      font-family: sans-serif; font-size: ${timeFontSize}px;
      color: var(--primary-text-color); text-align: center;
      letter-spacing: 0.5px; font-weight: 400; white-space: nowrap;
    `;

    const weekdayDisplay = document.createElement("div");
    weekdayDisplay.style.cssText = `
      position: absolute; top: ${weekdayTopPct}%; left: 50%;
      transform: translateX(-50%) translateY(-50%);
      font-family: sans-serif; font-size: ${smallFontSize}px;
      color: var(--primary-text-color); text-align: center; white-space: nowrap;
    `;

    const dateDisplay = document.createElement("div");
    dateDisplay.style.cssText = `
      position: absolute; top: ${dateTopPct}%; left: 50%;
      transform: translateX(-50%) translateY(-50%);
      font-family: sans-serif; font-size: ${smallFontSize}px;
      color: var(--primary-text-color); text-align: center; white-space: nowrap;
    `;

    textOverlay.appendChild(digitalTime);
    textOverlay.appendChild(weekdayDisplay);
    textOverlay.appendChild(dateDisplay);

    clock.appendChild(svg);
    clock.appendChild(textOverlay);
    content.appendChild(clock);
    card.appendChild(content);
    host.appendChild(card);
    this.content = content;

    // --- build ticks ---
    function buildTicks() {
      ticksGroup.innerHTML = "";

      if (!hide_MajorTicks) {
        for (let i = 1; i < 13; i++) {
          const ang = (i * 30 - 90) * Math.PI / 180;
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", 92 * Math.cos(ang));
          line.setAttribute("y1", 92 * Math.sin(ang));
          line.setAttribute("x2", 82 * Math.cos(ang));
          line.setAttribute("y2", 82 * Math.sin(ang));
          line.setAttribute("stroke", color_Ticks);
          line.setAttribute("stroke-width", "2");
          line.setAttribute("stroke-linecap", "round");
          ticksGroup.appendChild(line);
        }
      }

      if (!hide_MinorTicks) {
        for (let i = 0; i < 60; i++) {
          if (i % 5 === 0) continue;
          const ang = (i * 6 - 90) * Math.PI / 180;
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", 92 * Math.cos(ang));
          line.setAttribute("y1", 92 * Math.sin(ang));
          line.setAttribute("x2", 87 * Math.cos(ang));
          line.setAttribute("y2", 87 * Math.sin(ang));
          line.setAttribute("stroke", color_Ticks);
          line.setAttribute("stroke-width", "1");
          line.setAttribute("stroke-linecap", "round");
          ticksGroup.appendChild(line);
        }
      }
    }

    // --- build hand polygons ---
    function buildHourHand(ang) {
      const a = (ang - 90) * Math.PI / 180;
      const len = 48, w = 5;
      const tip = { x: len * Math.cos(a), y: len * Math.sin(a) };
      const lb = { x: w * Math.cos(a + Math.PI/2), y: w * Math.sin(a + Math.PI/2) };
      const rb = { x: w * Math.cos(a - Math.PI/2), y: w * Math.sin(a - Math.PI/2) };
      const tl = { x: 7 * Math.cos(a + Math.PI), y: 7 * Math.sin(a + Math.PI) };
      return `${tip.x},${tip.y} ${lb.x},${lb.y} ${tl.x},${tl.y} ${rb.x},${rb.y}`;
    }

    function buildMinHand(ang) {
      const a = (ang - 90) * Math.PI / 180;
      const len = 72, w = 4;
      const tip = { x: len * Math.cos(a), y: len * Math.sin(a) };
      const lb = { x: w * Math.cos(a + Math.PI/2), y: w * Math.sin(a + Math.PI/2) };
      const rb = { x: w * Math.cos(a - Math.PI/2), y: w * Math.sin(a - Math.PI/2) };
      const tl = { x: 7 * Math.cos(a + Math.PI), y: 7 * Math.sin(a + Math.PI) };
      return `${tip.x},${tip.y} ${lb.x},${lb.y} ${tl.x},${tl.y} ${rb.x},${rb.y}`;
    }

    function buildSecHand(ang) {
      // Floating triangle: tip outward, base inward
      const a = (ang - 90) * Math.PI / 180;
      const tipR = 80, baseR = 74, halfAngle = 0.05;
      const tip = { x: tipR * Math.cos(a), y: tipR * Math.sin(a) };
      const lb = { x: baseR * Math.cos(a + halfAngle), y: baseR * Math.sin(a + halfAngle) };
      const rb = { x: baseR * Math.cos(a - halfAngle), y: baseR * Math.sin(a - halfAngle) };
      return `${tip.x},${tip.y} ${lb.x},${lb.y} ${rb.x},${rb.y}`;
    }

    // --- apply colors to DOM ---
    function applyColors() {
      face.setAttribute("stroke", color_Ticks);
      ticksGroup.querySelectorAll("line").forEach(line => line.setAttribute("stroke", color_Ticks));
      digitalTime.style.color = color_DigitalTime;
      dateDisplay.style.color = color_Text;
      weekdayDisplay.style.color = color_Text;
      hourHand.setAttribute("fill", color_HourHand);
      minHand.setAttribute("fill", color_MinuteHand);
      secHand.setAttribute("fill", color_SecondHand);
      if (color_Background !== "rgba(0, 0, 0, 0)") {
        clock.style.background = color_Background;
        clock.style.borderRadius = "50%";
      }
      if (hide_DigitalTime) digitalTime.style.display = "none";
      if (hide_Date) dateDisplay.style.display = "none";
      if (hide_WeekDay) weekdayDisplay.style.display = "none";
      if (hide_SecondHand) secHand.style.display = "none";
    }

    // --- update clock ---
    function updateClock() {
      let now = new Date();
      if (demo) now = new Date(2021, 1, 10, 10, 8, 20);

      const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
      hourHand.setAttribute("points", buildHourHand(h * 30 + m * 0.5));
      minHand.setAttribute("points", buildMinHand(m * 6));
      secHand.setAttribute("points", buildSecHand(s * 6));

      let timeStr = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
      if (timeFormat) { try { timeStr = new Date().format.call(now, timeFormat); } catch(e) {} }
      digitalTime.textContent = timeStr;
      weekdayDisplay.textContent = now.toLocaleDateString(locale, { weekday: "long" });
      dateDisplay.textContent = new Date().format.call(now, dateMask || "yy年mm月dd日");
    }

    // --- parse config ---
    function getConfig() {
      if (config.color_Background) { color_Background = config.color_Background; }
      if (config.color_background) { color_Background = config.color_background; }
      if (color_Background.startsWith('--')) color_Background = getComputedStyle(document.documentElement).getPropertyValue(color_Background);

      if (config.color_Ticks) { color_Ticks = config.color_Ticks; }
      if (config.color_ticks) { color_Ticks = config.color_ticks; }
      if (color_Ticks.startsWith('--')) color_Ticks = getComputedStyle(document.documentElement).getPropertyValue(color_Ticks);

      if (config.hide_minorticks) hide_MinorTicks = config.hide_minorticks;
      if (config.hide_majorticks) hide_MajorTicks = config.hide_majorticks;

      if (config.color_FaceDigits) { color_FaceDigits = config.color_FaceDigits; }
      if (config.color_facedigits) { color_FaceDigits = config.color_facedigits; }

      if (config.locale) locale = config.locale;

      if (config.color_DigitalTime) { color_DigitalTime = config.color_DigitalTime; }
      if (config.color_digitaltime) { color_DigitalTime = config.color_digitaltime; }
      if (color_DigitalTime.startsWith('--')) color_DigitalTime = getComputedStyle(document.documentElement).getPropertyValue(color_DigitalTime);

      if (config.color_HourHand) { color_HourHand = config.color_HourHand; }
      if (config.color_hourhand) { color_HourHand = config.color_hourhand; }
      if (color_HourHand.startsWith('--')) color_HourHand = getComputedStyle(document.documentElement).getPropertyValue(color_HourHand);

      if (config.color_MinuteHand) { color_MinuteHand = config.color_MinuteHand; }
      if (config.color_minutehand) { color_MinuteHand = config.color_minutehand; }
      if (color_MinuteHand.startsWith('--')) color_MinuteHand = getComputedStyle(document.documentElement).getPropertyValue(color_MinuteHand);

      if (config.color_SecondHand) { color_SecondHand = config.color_SecondHand; }
      if (config.color_secondhand) { color_SecondHand = config.color_secondhand; }
      if (color_SecondHand.startsWith('--')) color_SecondHand = getComputedStyle(document.documentElement).getPropertyValue(color_SecondHand);

      if (config.color_Text) { color_Text = config.color_Text; }
      if (config.color_text) { color_Text = config.color_text; }
      if (color_Text.startsWith('--')) color_Text = getComputedStyle(document.documentElement).getPropertyValue(color_Text);

      if (config.hide_FaceDigits) hide_FaceDigits = config.hide_FaceDigits;
      if (config.hide_facedigits) hide_FaceDigits = config.hide_facedigits;
      if (config.hide_Date) hide_Date = config.hide_Date;
      if (config.hide_date) hide_Date = config.hide_date;
      if (config.hide_WeekDay) hide_WeekDay = config.hide_WeekDay;
      if (config.hide_weekday) hide_WeekDay = config.hide_weekday;
      if (config.hide_DigitalTime) hide_DigitalTime = config.hide_DigitalTime;
      if (config.hide_digitaltime) hide_DigitalTime = config.hide_digitaltime;
      if (config.hide_SecondHand) hide_SecondHand = config.hide_SecondHand;
      if (config.hide_secondhand) hide_SecondHand = config.hide_secondhand;
      if (config.dateformat) dateMask = config.dateformat;
      if (config.timeformat) timeFormat = config.timeformat;
      if (config.demo) demo = config.demo;
    }

    getConfig();
    buildTicks();
    applyColors();
    updateClock();

    setInterval(updateClock, hide_SecondHand ? 10000 : 1000);
  }

  setConfig(config) { this.config = config; }
  getCardSize() { return 3; }
}

Date.prototype.format = function (mask) {
  const d = this;
  const pad = (v, l = 2) => { v = String(v); while (v.length < l) v = "0" + v; return v; };
  const tokens = {
    d: d.getDate(), dd: pad(d.getDate()),
    m: d.getMonth() + 1, mm: pad(d.getMonth() + 1),
    yy: String(d.getFullYear()).slice(2), yyyy: d.getFullYear(),
    HH: pad(d.getHours()), H: d.getHours(),
    MM: pad(d.getMinutes()), M: d.getMinutes(),
    ss: pad(d.getSeconds()), s: d.getSeconds(),
  };
  return mask.replace(/(yy|mm|dd|HH|MM|ss|d|m|H|M|s)/g, m => tokens[m] !== undefined ? tokens[m] : m);
};

if (!customElements.get("analog-clock-html")) {
  customElements.define("analog-clock-html", AnalogClockHTML);
}
