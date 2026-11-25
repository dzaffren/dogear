# Forge rovo:mcp tools: what the site really does

**Date:** 2026-11-21 · **From:** /poc and /build agent-checkpoint

- A tool function gets `(payload, context)`. The caller's account ID is in
  `context.principal.accountId`, not in `context.accountId` as in a resolver.
- `api.asUser()` in a tool throws `NeedsAuthenticationError` ("Authentication Required")
  until the person selects Allow access in a panel of the same app. The OAuth sign-in of
  the MCP client does not count as that consent. `asApp()` works with no consent.
- The site admin switch "Expose tools to MCP-compatible apps" is per app and per site,
  under Connected apps. It is off after each new install.
- In the development environment, each tool name ends in `_development`.
- A string that the function returns reaches the MCP client as plain text content.
- `forge lint` accepts `required: false` on an action input.
- The MCP SDK's `auth` asks for each scope that the server lists when no scope is given.
  Atlassian refused a link with only `read:me read:jira-work write:jira-work offline_access`
  as `invalid_request`. The default list worked.
- The SDK refreshes an expired access token by itself through the provider, and saves a
  new refresh token each time. A test script can keep an MCP login.
- Atlassian's MCP OAuth server lets a client register itself (dynamic client registration),
  so a script needs no app in the developer console for its login.
- A new tool in the `tools` list of a deployed `rovo:mcp` module shows to an MCP sign-in
  from before the deploy: the e2e login called `list-at-risk-dogears` with no new sign-in
  (2026-11-24). A sign-in from before the install of an environment still does not.
