# Forge app name, icon and tool names: what the site really does

**Date:** 2026-11-23 · **From:** /spec and /build dogear-brand

- Atlassian's MCP server reports `serverInfo.name` as `integrations-service` for each app.
  The `name` of the `rovo:mcp` module does not reach an MCP client. An agent shows the name
  that the person gave when they added the server.
- `forge lint` allows 255 characters for the `description` of an action. A longer one fails
  with "must NOT have more than 255 characters", and the line number in the message is 1:0.
- New keys for the two actions of the `rovo:mcp` module need no major version. After the
  deploy, the MCP server lists the new tool names at once, and the admin switch "Expose
  tools to MCP-compatible apps" stays on.
- `forge deploy` prints the app's name from the developer console, not from the repo. The
  name changes only in the Settings of the app in the console. Settings also has the avatar.
- `forge console` prints the direct link to the app in the developer console. The list of a
  developer space can look empty while the direct link works.
- The docs call the `icon` of `jira:issueContext` "the absolute URL of the icon". They
  describe a folder of bundled static files only for Custom UI. Nobody tried a bundled icon
  in this UI Kit app.
- The manifest schema caps `icon` at 255 characters, so a data URI of an image does not fit.
- Devpost refuses automated reads of a hackathon's rules page: a plain fetch gets 403, and a
  browser gets a bot check. Ask for the text.
