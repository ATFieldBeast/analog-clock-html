class AnalogClockHTML extends HTMLElement {
  set hass(hass) {
    if (this.content) return;

    console.info("%c ANALOG-CLOCK-HTML v2.0 ", "color: primary-text-color; font-weight: 400; background: transparent");

    const config = this.config || {};

    // ==================== Default configuration ====================
    let color_Background = "rgba(0, 0, 0, 0)";
    let color_Ticks = "var(--primary-text-color)";
    let color_FaceDigits = "var(--primary-text-color)";
    let color_DigitalTime = "var(--primary-text-color)";
    let color_HourHand = "var(--primary-text-color)";
    let color_MinuteHand = "var(--primary-text-color)";
    let color_SecondHand = "var(--primary-text-color)";
    let color_Text = "var(--primary-text-color)";
    let color_Date = "";
    let color_Weekday = "";
    let color_WeekNumber = "";
    let dateFormat = "";
    let timeFormat = "";
    let locale = hass.language || Intl.DateTimeFormat().resolvedOptions().locale;
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let timezoneDisplayName = "";
    let hide_Timezone = true;
    let hide_MinorTicks = false;
    let hide_MajorTicks = false;
    let hide_FaceDigits = false;
    let hide_Date = false;
    let hide_WeekDay = false;
    let hide_WeekNumber = true;
    let hide_DigitalTime = false;
    let hide_HourHand = false;
    let hide_MinuteHand = false;
    let hide_SecondHand = false;
    let demo = false;

    // ==================== Clock size calculation ====================
    // Accepts number (px) or string ("NNNpx"), clamped between 100-2000
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

    // ==================== DOM structure ====================
    // <ha-card> -> <div> (flex center) -> <div class="clock-face"> -> [svg, textOverlay]
    const card = document.createElement("ha-card");
    const content = document.createElement("div");
    content.style.cssText = "display:flex;justify-content:center;padding:5px;";

    const clock = document.createElement("div");
    clock.className = "clock-face";
    clock.style.cssText = `position:relative;width:${clockSize}px;height:${clockSize}px;`;

    // SVG coordinate system: viewBox="-100 -100 200 200", origin at center
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "-100 -100 200 200");
    svg.setAttribute("width", clockSize);
    svg.setAttribute("height", clockSize);
    svg.style.cssText = "position:absolute;top:0;left:0;overflow:visible;";

    // Outer circle (border ring)
    const face = document.createElementNS(svgNS, "circle");
    face.setAttribute("cx", "0");
    face.setAttribute("cy", "0");
    face.setAttribute("r", "96");
    face.setAttribute("fill", "none");
    svg.appendChild(face);

    // SVG groups for ticks and digits (rendered behind hands)
    const ticksGroup = document.createElementNS(svgNS, "g");
    svg.appendChild(ticksGroup);

    const digitsGroup = document.createElementNS(svgNS, "g");
    svg.appendChild(digitsGroup);

    // Clock hands as SVG polygons (rendered above ticks/digits)
    const hourHand = document.createElementNS(svgNS, "polygon");
    hourHand.setAttribute("stroke", "none");
    svg.appendChild(hourHand);

    const minHand = document.createElementNS(svgNS, "polygon");
    minHand.setAttribute("stroke", "none");
    svg.appendChild(minHand);

    const secHand = document.createElementNS(svgNS, "polygon");
    secHand.setAttribute("stroke", "none");
    svg.appendChild(secHand);

    // HTML overlay for digital time and text (above SVG)
    const textOverlay = document.createElement("div");
    textOverlay.style.cssText = `
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none; z-index: 10;
    `;

    // Layout positions (percentage-based for responsiveness)
    const timeTopPct = 35, weekdayTopPct = 60, dateTopPct = 70;
    const weekNumLeftPct = 25;
    const timeFontSize = Math.round(clockSize * 0.16);
    const smallFontSize = Math.round(clockSize * 0.07);

    // Digital time display (HH:MM)
    const digitalTime = document.createElement("div");
    digitalTime.style.cssText = `
      position: absolute; top: ${timeTopPct}%; left: 50%;
      transform: translateX(-50%) translateY(-50%);
      font-family: sans-serif; font-size: ${timeFontSize}px;
      color: var(--primary-text-color); text-align: center;
      letter-spacing: 0.5px; font-weight: 400; white-space: nowrap;
    `;

    // Weekday name or timezone name
    const weekdayDisplay = document.createElement("div");
    weekdayDisplay.style.cssText = `
      position: absolute; top: ${weekdayTopPct}%; left: 50%;
      transform: translateX(-50%) translateY(-50%);
      font-family: sans-serif; font-size: ${smallFontSize}px;
      color: var(--primary-text-color); text-align: center; white-space: nowrap;
    `;

    // ISO week number
    const weekNumberDisplay = document.createElement("div");
    weekNumberDisplay.style.cssText = `
      position: absolute; top: 50%; left: ${weekNumLeftPct}%;
      transform: translateX(-50%) translateY(-50%);
      font-family: sans-serif; font-size: ${smallFontSize}px;
      color: var(--primary-text-color); text-align: center; white-space: nowrap;
    `;

    // Date string
    const dateDisplay = document.createElement("div");
    dateDisplay.style.cssText = `
      position: absolute; top: ${dateTopPct}%; left: 50%;
      transform: translateX(-50%) translateY(-50%);
      font-family: sans-serif; font-size: ${smallFontSize}px;
      color: var(--primary-text-color); text-align: center; white-space: nowrap;
    `;

    textOverlay.appendChild(digitalTime);
    textOverlay.appendChild(weekdayDisplay);
    textOverlay.appendChild(weekNumberDisplay);
    textOverlay.appendChild(dateDisplay);

    clock.appendChild(svg);
    clock.appendChild(textOverlay);
    content.appendChild(clock);
    card.appendChild(content);
    this.appendChild(card);
    this.content = content;

    // ==================== Time utilities ====================

    // Cached Intl.DateTimeFormat instances per timezone
    const _formatters = new Map();
    const getTimeFormatter = (tz) => {
      if (!_formatters.has(tz)) {
        _formatters.set(tz, {
          time: new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false, hour: "numeric", minute: "numeric", second: "numeric" }),
          date: new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" })
        });
      }
      return _formatters.get(tz);
    };

    // Extract hour, minute, second from date in specified timezone
    function getTimeParts(date, tz) {
      const f = getTimeFormatter(tz);
      const parts = f.time.formatToParts(date);
      const get = (type) => parseInt(parts.find(p => p.type === type)?.value ?? "0", 10);
      return { h: get("hour"), m: get("minute"), s: get("second") };
    }

    // Extract year, month, day from date in specified timezone
    function getDateParts(date, tz) {
      const f = getTimeFormatter(tz);
      const parts = f.date.formatToParts(date);
      const get = (type) => parseInt(parts.find(p => p.type === type)?.value ?? "1", 10);
      return { y: get("year"), mo: get("month"), d: get("day") };
    }

    // Convert time values to rotation angles (0 degrees = 12 o'clock)
    function getHourAngle(h, m) { return (h % 12) * 30 + m * 0.5; }
    function getMinAngle(m)     { return m * 6; }
    function getSecAngle(s)     { return s * 6; }

    // Calculate ISO 8601 week number for a given date
    // Week 1 is the week containing the first Thursday of the year
    function getISOWeek(tzDate) {
      const d = new Date(Date.UTC(tzDate.getUTCFullYear(), tzDate.getUTCMonth(), tzDate.getUTCDate()));
      d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
      const week1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
      const dayDiff = (d.getTime() - week1.getTime()) / 86400000;
      return 1 + Math.round((dayDiff - 3 + ((week1.getUTCDay() + 6) % 7)) / 7);
    }

    // Format date/time using a mask string
    // Supports: yyyy, yy, mm, m, dd, d, HH, H, MM, M, ss, s
    function formatDate(date, formatStr, tz) {
      const { y, mo, d } = getDateParts(date, tz);
      const { h, m, s } = getTimeParts(date, tz);
      const pad = (v) => String(v).padStart(2, "0");
      const tokens = {
        yyyy: y, yy: String(y).slice(-2),
        mm: pad(mo), m: mo,
        dd: pad(d), d: d,
        HH: pad(h), H: h,
        MM: pad(m), M: m,
        ss: pad(s), s: s,
      };
      return formatStr.replace(/yyyy|yy|mm|m|dd|d|HH|H|MM|M|ss|s/g, k => tokens[k] ?? k);
    }

    // ==================== Render functions ====================

    // Draw tick marks (major at hours, minor at minutes)
    function buildTicks() {
      ticksGroup.innerHTML = "";

      const addTick = (ang, r1, r2, strokeWidth) => {
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", r1 * Math.cos(ang));
        line.setAttribute("y1", r1 * Math.sin(ang));
        line.setAttribute("x2", r2 * Math.cos(ang));
        line.setAttribute("y2", r2 * Math.sin(ang));
        line.setAttribute("stroke", color_Ticks);
        line.setAttribute("stroke-width", strokeWidth);
        line.setAttribute("stroke-linecap", "round");
        ticksGroup.appendChild(line);
      };

      if (!hide_MajorTicks) {
        for (let i = 1; i < 13; i++) {
          addTick((i * 30 - 90) * Math.PI / 180, 92, 82, 2);
        }
      }

      if (!hide_MinorTicks) {
        for (let i = 0; i < 60; i++) {
          if (i % 5 === 0) continue;
          addTick((i * 6 - 90) * Math.PI / 180, 92, 87, 1);
        }
      }
    }

    // Draw hour numbers 1-12 on the clock face
    function buildFaceDigits() {
      digitsGroup.innerHTML = "";

      if (!hide_FaceDigits) {
        for (let num = 1; num < 13; num++) {
          const ang = (num * 30 - 90) * Math.PI / 180;
          const text = document.createElementNS(svgNS, "text");
          text.setAttribute("x", 72 * Math.cos(ang));
          text.setAttribute("y", 72 * Math.sin(ang));
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "central");
          text.setAttribute("fill", color_FaceDigits);
          text.setAttribute("font-size", Math.round(clockSize * 0.05));
          text.setAttribute("font-family", "sans-serif");
          text.textContent = num;
          digitsGroup.appendChild(text);
        }
      }
    }

    // Generate polygon points for hour hand (tapered rectangle shape)
    function buildHourHand(ang) {
      const a = (ang - 90) * Math.PI / 180;
      const len = 48, w = 5;
      const tip = { x: len * Math.cos(a), y: len * Math.sin(a) };
      const lb = { x: w * Math.cos(a + Math.PI/2), y: w * Math.sin(a + Math.PI/2) };
      const rb = { x: w * Math.cos(a - Math.PI/2), y: w * Math.sin(a - Math.PI/2) };
      const tl = { x: 7 * Math.cos(a + Math.PI), y: 7 * Math.sin(a + Math.PI) };
      return `${tip.x},${tip.y} ${lb.x},${lb.y} ${tl.x},${tl.y} ${rb.x},${rb.y}`;
    }

    // Generate polygon points for minute hand (tapered rectangle shape)
    function buildMinHand(ang) {
      const a = (ang - 90) * Math.PI / 180;
      const len = 72, w = 4;
      const tip = { x: len * Math.cos(a), y: len * Math.sin(a) };
      const lb = { x: w * Math.cos(a + Math.PI/2), y: w * Math.sin(a + Math.PI/2) };
      const rb = { x: w * Math.cos(a - Math.PI/2), y: w * Math.sin(a - Math.PI/2) };
      const tl = { x: 7 * Math.cos(a + Math.PI), y: 7 * Math.sin(a + Math.PI) };
      return `${tip.x},${tip.y} ${lb.x},${lb.y} ${tl.x},${tl.y} ${rb.x},${rb.y}`;
    }

    // Generate polygon points for second hand (thin floating triangle)
    function buildSecHand(ang) {
      const a = (ang - 90) * Math.PI / 180;
      const tipR = 80, baseR = 74, halfAngle = 0.05;
      const tip = { x: tipR * Math.cos(a), y: tipR * Math.sin(a) };
      const lb = { x: baseR * Math.cos(a + halfAngle), y: baseR * Math.sin(a + halfAngle) };
      const rb = { x: baseR * Math.cos(a - halfAngle), y: baseR * Math.sin(a - halfAngle) };
      return `${tip.x},${tip.y} ${lb.x},${lb.y} ${rb.x},${rb.y}`;
    }

    // Apply color settings to all clock elements
    function applyColors() {
      face.setAttribute("stroke", color_Ticks);
      ticksGroup.querySelectorAll("line").forEach(line => line.setAttribute("stroke", color_Ticks));
      digitsGroup.querySelectorAll("text").forEach(text => text.setAttribute("fill", color_FaceDigits));
      digitalTime.style.color = color_DigitalTime;
      dateDisplay.style.color = color_Date || color_Text;
      weekdayDisplay.style.color = color_Weekday || color_Text;
      weekNumberDisplay.style.color = color_WeekNumber || color_Text;
      hourHand.setAttribute("fill", color_HourHand);
      minHand.setAttribute("fill", color_MinuteHand);
      secHand.setAttribute("fill", color_SecondHand);
      if (color_Background !== "rgba(0, 0, 0, 0)") {
        clock.style.background = color_Background;
        clock.style.borderRadius = "50%";
      }
      if (hide_FaceDigits) digitsGroup.style.display = "none";
      if (hide_DigitalTime) digitalTime.style.display = "none";
      if (hide_Date) dateDisplay.style.display = "none";
      if (hide_WeekDay) weekdayDisplay.style.display = "none";
      if (hide_WeekNumber) weekNumberDisplay.style.display = "none";
      if (hide_HourHand) hourHand.style.display = "none";
      if (hide_MinuteHand) minHand.style.display = "none";
      if (hide_SecondHand) secHand.style.display = "none";
    }

    // ==================== Clock update ====================

    // Refresh all clock displays with current time
    function updateClock() {
      const now = demo ? new Date(Date.UTC(2000, 0, 1, 12, 15, 30)) : new Date();

      const { h, m, s } = getTimeParts(now, timezone);
      const { y, mo, d } = getDateParts(now, timezone);
      const tzDate = new Date(Date.UTC(y, mo - 1, d));

      // Update hand positions
      hourHand.setAttribute("points", buildHourHand(getHourAngle(h, m)));
      minHand.setAttribute("points", buildMinHand(getMinAngle(m)));
      secHand.setAttribute("points", buildSecHand(getSecAngle(s)));

      // Update digital time display
      digitalTime.textContent = timeFormat
        ? formatDate(now, timeFormat, timezone)
        : now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: timezone });

      // Update weekday or timezone name
      weekdayDisplay.textContent = hide_Timezone
        ? now.toLocaleDateString(locale, { weekday: "long", timeZone: timezone })
        : (timezoneDisplayName || timezone);

      // Update ISO week number
      weekNumberDisplay.textContent = getISOWeek(tzDate);

      // Update date display
      dateDisplay.textContent = dateFormat
        ? formatDate(now, dateFormat, timezone)
        : now.toLocaleDateString(locale, { timeZone: timezone });
    }

    // ==================== Configuration parsing ====================

    // Read user config and override defaults
    // Supports both camelCase (colorHourHand) and snake_case (color_hourhand)
    function getConfig() {
      if (config.color_Background) { color_Background = config.color_Background; }
      if (config.color_background) { color_Background = config.color_background; }
      if (color_Background.startsWith('--')) color_Background = getComputedStyle(document.documentElement).getPropertyValue(color_Background);

      if (config.color_Ticks) { color_Ticks = config.color_Ticks; }
      if (config.color_ticks) { color_Ticks = config.color_ticks; }
      if (color_Ticks.startsWith('--')) color_Ticks = getComputedStyle(document.documentElement).getPropertyValue(color_Ticks);

      if (config.color_FaceDigits) { color_FaceDigits = config.color_FaceDigits; }
      if (config.color_facedigits) { color_FaceDigits = config.color_facedigits; }
      if (color_FaceDigits.startsWith('--')) color_FaceDigits = getComputedStyle(document.documentElement).getPropertyValue(color_FaceDigits);

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

      if (config.color_Date) { color_Date = config.color_Date; }
      if (config.color_date) { color_Date = config.color_date; }
      if (color_Date.startsWith('--')) color_Date = getComputedStyle(document.documentElement).getPropertyValue(color_Date);

      if (config.color_Weekday) { color_Weekday = config.color_Weekday; }
      if (config.color_weekday) { color_Weekday = config.color_weekday; }
      if (color_Weekday.startsWith('--')) color_Weekday = getComputedStyle(document.documentElement).getPropertyValue(color_Weekday);

      if (config.color_WeekNumber) { color_WeekNumber = config.color_WeekNumber; }
      if (config.color_weeknumber) { color_WeekNumber = config.color_weeknumber; }
      if (color_WeekNumber.startsWith('--')) color_WeekNumber = getComputedStyle(document.documentElement).getPropertyValue(color_WeekNumber);

      if (config.dateformat) dateFormat = config.dateformat;
      if (config.dateFormat) dateFormat = config.dateFormat;
      if (config.timeformat) timeFormat = config.timeformat;
      if (config.timeFormat) timeFormat = config.timeFormat;
      if (config.locale) locale = config.locale;
      if (config.timezone) timezone = config.timezone;
      if (config.timezoneDisplayName) timezoneDisplayName = config.timezoneDisplayName;
      if (config.timezonedisplayname) timezoneDisplayName = config.timezonedisplayname;
      if (config.hide_Timezone !== undefined) hide_Timezone = config.hide_Timezone;
      if (config.hide_timezone !== undefined) hide_Timezone = config.hide_timezone;
      if (config.hide_MinorTicks !== undefined) hide_MinorTicks = config.hide_MinorTicks;
      if (config.hide_minorticks !== undefined) hide_MinorTicks = config.hide_minorticks;
      if (config.hide_MajorTicks !== undefined) hide_MajorTicks = config.hide_MajorTicks;
      if (config.hide_majorticks !== undefined) hide_MajorTicks = config.hide_majorticks;
      if (config.hide_FaceDigits !== undefined) hide_FaceDigits = config.hide_FaceDigits;
      if (config.hide_facedigits !== undefined) hide_FaceDigits = config.hide_facedigits;
      if (config.hide_Date !== undefined) hide_Date = config.hide_Date;
      if (config.hide_date !== undefined) hide_Date = config.hide_date;
      if (config.hide_WeekDay !== undefined) hide_WeekDay = config.hide_WeekDay;
      if (config.hide_weekday !== undefined) hide_WeekDay = config.hide_weekday;
      if (config.hide_WeekNumber !== undefined) hide_WeekNumber = config.hide_WeekNumber;
      if (config.hide_weeknumber !== undefined) hide_WeekNumber = config.hide_weeknumber;
      if (config.hide_DigitalTime !== undefined) hide_DigitalTime = config.hide_DigitalTime;
      if (config.hide_digitaltime !== undefined) hide_DigitalTime = config.hide_digitaltime;
      if (config.hide_HourHand !== undefined) hide_HourHand = config.hide_HourHand;
      if (config.hide_hourhand !== undefined) hide_HourHand = config.hide_hourhand;
      if (config.hide_MinuteHand !== undefined) hide_MinuteHand = config.hide_MinuteHand;
      if (config.hide_minutehand !== undefined) hide_MinuteHand = config.hide_minutehand;
      if (config.hide_SecondHand !== undefined) hide_SecondHand = config.hide_SecondHand;
      if (config.hide_secondhand !== undefined) hide_SecondHand = config.hide_secondhand;
      if (config.demo !== undefined) demo = config.demo;
    }

    // ==================== Initialization ====================

    getConfig();
    buildTicks();
    buildFaceDigits();
    applyColors();
    updateClock();

    setInterval(updateClock, hide_SecondHand ? 10000 : 1000);
  }

  setConfig(config) { this.config = config; }
  getCardSize() { return 3; }
}

// ==================== Custom element registration ====================
if (!customElements.get("analog-clock-html")) {
  customElements.define("analog-clock-html", AnalogClockHTML);
}
