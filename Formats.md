This formatting is a simplified subset inspired by [javascript-date-format](https://blog.stevenlevithan.com/archives/javascript-date-format).

## Supported Tokens

| Mask | Description |
| --- | --- |
| d | Day without leading zero |
| dd | Day with leading zero |
| m | Month without leading zero |
| mm | Month with leading zero |
| yy | Last 2 digits of year |
| yyyy | Full year |
| H | Hour (24h) without leading zero |
| HH | Hour (24h) with leading zero |
| M | Minute without leading zero |
| MM | Minute with leading zero |
| s | Second without leading zero |
| ss | Second with leading zero |

## Examples

Date formats:

| Format | Example |
| --- | --- |
| yy/mm/dd | 26/04/02 |
| yyyy-mm-dd | 2026-04-02 |
| yy年mm月dd日 | 26年04月02日 |
| dd-mm-yyyy | 02-04-2026 |
| d/m/yyyy | 2/4/2026 |

Time formats:

| Format | Example |
| --- | --- |
| HH:MM | 09:30 |
| HH:MM:ss | 09:30:05 |
| H:MM | 9:30 |
| H:MM:ss | 9:30:05 |
| H:M | 9:30 |
| H:MM:s | 9:30:5 |

Combined date and time:

| Format | Example |
| --- | --- |
| yyyy-mm-dd'T'HH:MM:ss | 2026-04-02T09:30:05 |
| yy/mm/dd HH:MM | 26/04/02 09:30 |
