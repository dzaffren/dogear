# Rehearsal of the judge's entry

**Date:** 2026-11-23 · **Site:** a new free Jira site of a second Atlassian account (D33)
· **App:** Dogear 2.1.0, production · **Guide:** `GUIDE.md` on `feat/judge-ready-entry`

Dzafran followed the guide as a judge, from the installation link.

| Part | Step | Result |
| ---- | ---- | ------ |
| 1 | Install from the link, then Allow access | As the guide says |
| 1 | The icon beside "Dogear" in the panel and "Dogears" in the tab, light theme | Fine |
| 1 | The icon in the dark theme | Not checked on the site (O23) |
| 2 | New ticket, empty Dogears tab, brief, "Use as dogear", save | As the guide says |
| 2 | "Saved by" shows the second account's name | Yes |
| 2 | Stopwatch | 2 minutes or less |
| 3 | Connect a coding agent | Not rehearsed (O24) |

## Proof in the logs

`bash scripts/forge.sh logs -e production --since 24h` showed the rehearsal, 12 seconds
from the brief to the save. The brief came 9 minutes after the guide got its installation
link, and its `count=1` on the same UTC day as the spike's brief means another install:

```
INFO 2026-11-23T16:41:51.161Z brief built issue=<rehearsal ticket> ms=1558 in=337 out=64 count=1
INFO 2026-11-23T16:42:03.283Z dogear saved issue=<rehearsal ticket>
```

## Failures and fixes

None. The guide and the app need no change.
