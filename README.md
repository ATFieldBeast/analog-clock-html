# Lovelace Analog Clock (HTML Version)

This is a fork of the original [Analog Clock](https://github.com/tomasrudh/analogclock) card, reimplemented using SVG + HTML/CSS rendering instead of Canvas 2D for sharper display on HiDPI screens.

![clock-new](https://github.com/ATFieldBeast/analog-clock-html/blob/main/Images/clock-new.png?raw=true)
![clock-old](https://github.com/ATFieldBeast/analog-clock-html/blob/main/Images/clock-old.png?raw=true)

## Improvements over Original

- **Sharper display**: SVG + HTML/CSS rendering, always crisp on any DPI
- **Auto theme adaptation**: Default use `var(--primary-text-color)` for automatic light/dark mode switching via browser

## Not Implemented

The following features from the original are not yet available:

| Feature | Workaround |
|---------|------------|
| `style_hourhand` / `style_minutehand` / `style_secondhand` | Fixed to display a single hand style |
| Custom watch face (picture-elements) | - |

## Installation

Add `https://github.com/ATFieldBeast/analog-clock-html` as a custom repository of type Dashboard in HACS.

Search and install the 'Analog Clock HTML'.

## Configuration of the Example Picture Above

```yaml
type: custom:analog-clock-html
diameter: 260
locale: zh
timezone: Asia/Shanghai
dateformat: yy年mm月dd日
hide_facedigits: true
hide_hourhand: true
hide_minutehand: true
```

---

# Some Original Repository Instructions
An analog clock card for Home Assistant Lovelace. Colors are fully customizable, weekday names and date formats are localizable.
This one accepts vw % and variable --clock-size

## Configuration

For a list of available options for dateformat and timeformat, see [Formats](https://github.com/ATFieldBeast/analog-clock-html/blob/main/Formats.md).

![Analog clock2](https://github.com/ATFieldBeast/analog-clock-html/blob/main/Images/AnalogClock2.png?raw=true)

| Name | Type | Default | Description
| --- | --- | --- | --- |
| color_background | String | transparent | Background color of the clock |
| color_ticks | String | var(--primary-text-color) | Color of the border ticks |
| color_facedigits | String | var(--primary-text-color) | Color of the face digits |
| color_digitaltime | String | var(--primary-text-color) | Color of the digital time |
| color_hourhand | String | var(--primary-text-color) | Color of the hour hand |
| color_minutehand | String | var(--primary-text-color) | Color of the minute hand |
| color_secondhand | String | var(--primary-text-color) | Color of the second hand |
| color_text | String | var(--primary-text-color) | Color of all texts (date, weekday, weeknumber) |
| color_date | String | color_text | Color of the date |
| color_weekday | String | color_text | Color of the weekday |
| color_weeknumber | String | color_text | Color of the week number |
| dateformat | String | HA / browser | Format for the date |
| timeformat | String | HA / browser | Format for the time |
| locale | String | HA / browser | Locale for date and week day |
| timezone | String | Browser | Time zone, for example Europe/Stockholm [Time zones](https://timezonedb.com/time-zones)|
| timezonedisplayname | String | | Custom name for the displayed time zone |
| hide_timezone | Boolean | true | If true, hide time zone (show weekday instead) |
| hide_minorticks | Boolean | false | Hides the minor ticks |
| hide_majorticks | Boolean | false | Hides the major ticks and the outer circle |
| hide_facedigits | Boolean | false | If true, the hour numbers are hidden |
| hide_date | Boolean | false | If true, the date is hidden |
| hide_weekday | Boolean | false | If true, the week day is hidden |
| hide_weeknumber | Boolean | true | If true, the week number is hidden |
| hide_digitaltime | Boolean | false | If true, the digital time hidden |
| hide_hourhand | Boolean | false | If true, the hour hand is hidden |
| hide_minutehand | Boolean | false | If true, the minute hand is hidden |
| hide_secondhand | Boolean | false | If true, the second hand is hidden |
| diameter | Integer | 220 | Diameter of the clock |

### Colors

All colors can be entered in one of four different ways:
- "green" The color in plain text. [Available colors](https://www.w3.org/TR/css-color-3/#svg-color)
- "#3273a8" The first two digits are the level of Red in hex, 00 - FF. The second two Green, and the last two Blue. "#000000" is black, "#FF00FF" is bright pink and "#FFFFFF" is white.
- rgba(0,0,0,0) The first two number is the level of Red in decimal, 0 - 255. The second Green, the third Blue and the last is alpha. Alpha is in decimal 0 - 1, where 0 is transparent. rgba(0,0,0,1) is black, rgba(255,0,255,1) is bright pink, rgba(0,0,0,1) is white and rgba(0,0,0,0.5) is semi transparent. Note that the value should not be quoted.
- "--secondary-text-color" Refers to Home Assistant CSS variables.

### Examples

![Analog clock3](https://github.com/ATFieldBeast/analog-clock-html/blob/main/Images/AnalogClock3.png?raw=true)

```
- type: "custom:analog-clock"
  hide_secondHand: true
  locale: sv-SE
  diameter: 200 (you can now use vw % --var-clocksize)
  color_hourhand: "#326ba8"
  color_minutehand: "#3273a8"
  color_digitaltime: "#CCCCCC"
  color_facedigits: "#a83832"
  color_ticks: "Silver"
  themes:
  - time: 23:00-08:00
    color_background: maroon
```
