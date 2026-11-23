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
- A person who selected Allow access in development got no prompt in production.
- A pick-up brief works in production with no billing step: the model answered in 3
  seconds on app version 2.0.0.
- `forge logs` does not work in production. Read the logs in the developer console.
- After the admin turned on the tools of the production install, the MCP server still
  listed only the two `_development` tools for a login that was made before that install.
  Nobody knows the production tool names yet.
- `forge uninstall -i <installation id> -e production -s <site> -p Jira` removes one
  install and keeps the other.
