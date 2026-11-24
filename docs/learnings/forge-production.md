# Forge production: what the site really does

**Date:** 2026-11-23 · **From:** /poc for judge-ready-entry

- A UI Kit app can bundle an icon. Add a resource whose `path` is a folder, such as
  `static/icons`, and set `icon: resource:icons;dogear.svg` on the module. It works on
  `jira:issueContext` and on `jira:projectPage`. Jira serves the file from
  `icon.cdn.prod.atlassian-dev.net`. The deploy is a minor version.
- Jira keeps a user's theme on its side. A Playwright `colorScheme: 'dark'` does not change
  it, and Jira puts back `data-color-mode` when a script changes it.
- The first `forge deploy -e production` needs no approval flag. Forge variables are apart
  for each environment, so set `NOTE_SIGNING_KEY` for production before that deploy.
- One site can have the development install and the production install at once. The
  ticket then shows two panels: "Dogear" with a DEV mark, and "Dogear".
- Both installs read the same issue property, so a dogear from development shows in the
  production panel.
- The test account's production panel showed a dogear with no Allow access prompt. The
  main account's first call of the production tool `get-dogear` answered "select Allow
  access". Treat the consent as apart for each environment.
- A pick-up brief works in production with no billing step: the model answered in 3
  seconds on app version 2.0.0.
- `forge logs -e production --since 24h` works, and shows the logs of every site that
  installed the app. A short `--since` window can miss a run: widen it before deciding a
  run left no log.
- In production, the MCP tool names have no suffix: `get-dogear` and `save-dogear`. They
  show only after the admin switch is on for that install and after a new MCP sign-in. A
  sign-in from before the install lists only the tools it knew.
- A merged pull request keeps its commits on GitHub, with each author's email address. A
  force-push of `main` does not remove them.
- `forge uninstall -i <installation id> -e production -s <site> -p Jira` removes one
  install and keeps the other.
