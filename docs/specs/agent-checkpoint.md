# Agent checkpoint

**Version:** v1 · **Status:** Draft · **Type:** Feature · **Project type:** Web UI

**Shape doc:** docs/specs/ticket-handover/shape.md
**Depends on:** stand-note

A coding agent such as Claude Code saves the stand note on a Jira ticket as it works, and
a second agent reads the note and carries on. It ships now because it removes the reason
notes go missing, and it qualifies the entry for the Atlassian MCP bonus prize (D1).

## Problem

The stand note from `stand-note` is only as current as the last time a person stopped to
write it. A developer who works with a coding agent does not stop: the agent holds the
state of the work, and the state leaves when the session ends. The teammate who picks up
the ticket, or their agent, then starts from the ticket text alone.

## Spike findings, 2026-11-21

A throwaway Forge app answered O1. The spike code is deleted, and the app is uninstalled.

- The manifest needs one `rovo:mcp` module that lists action keys, one `action` for each tool
  with `actionVerb` and `inputs`, and one `function` for each action.
- The function gets `(payload, context)`. The payload holds the inputs. The caller's account ID
  is in `context.principal.accountId`.
- The string that the function returns comes back to the agent as the tool result.
- Outside access is off by default. The switch is "Expose tools to MCP-compatible apps", on the
  app's page under Connected apps in Atlassian Administration. It is set for each site.
- `claude mcp add --transport http <name> https://mcp.atlassian.com/forge/<appId>`, then `/mcp`,
  connects Claude Code. The person signs in on Atlassian's OAuth screen.
- In the development environment, the tool name ends in `_development`: the action
  `save-probe` showed in Claude Code as `save-probe_development`.
- `asUser()` threw "Authentication Required" on the first call. The OAuth screen of the MCP
  sign-in does not count as consent. After the person selected "Allow access" in a panel of
  the same app, `asUser()` read `/myself` as the person and wrote the property.
- `asApp()` wrote the property with no consent. Jira then sees the app as the writer.
- The docs say Rovo must be active on the site. The spike did not check if the site needs it.

## Open items

| ID  | What | Type | Raised at | Owner | Status | Answer |
| --- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1  | An outside agent such as Claude Code can call this app's tools through the Atlassian MCP server and save a note on a ticket. The `rovo:mcp` module is in Preview. The Forge docs say a site admin turns on outside access, and the endpoint is `https://mcp.atlassian.com/forge/<appId>`. One community post says the Preview serves only Rovo agents. (from shape O5) | unproven | shape | poc | Resolved | Yes, with a condition. A throwaway app with one `rovo:mcp` tool was called from Claude Code through `https://mcp.atlassian.com/forge/<appId>`, and the tool wrote an issue property on PAY-1. The tool gets the caller's account ID in `principal.accountId`. A site admin first turns on "Expose tools to MCP-compatible apps" for the app. The condition: `asUser()` fails with "Authentication Required" until the person selects "Allow access" in a panel of the same app. After that, `asUser()` wrote the property with status 201. `asApp()` works with no consent. The fallback through the built-in tools is not needed. The spike took 18 of 60 minutes, and its code is deleted. 2026-11-21 |
| O2  | What does the saved line say when an agent saved the note? | question | spec p1 | user | Resolved | "Saved by Aisyah Rahman through an agent, just now". The app knows that the save came through the MCP tool. It does not take the agent's name on the agent's word. 2026-11-21 |
| O3  | An agent sends some of the four fields. What happens to the fields that it does not send? | question | spec p1 | user | Resolved | The save replaces the whole note, as in the panel. A field that the agent does not send is empty after the save. 2026-11-21 |
| O4  | An agent sends a field of more than 1,000 characters. | question | spec p1 | user | Resolved | The app refuses the save and names the field: "Done has 1,240 characters. The limit is 1,000." Nothing is saved. 2026-11-21 |

_Never delete this section or its rows. See references/ledger.md._

## Glossary

- **Forge** — Atlassian's platform for apps that run inside Jira and its other products.
- **MCP** — Model Context Protocol, the standard way an AI agent calls outside tools.
- **Atlassian MCP server** — the server that gives an agent tools for Jira and other Atlassian products.
- **`rovo:mcp`** — the Forge module that publishes an app's own tools on the Atlassian MCP server.
- **Preview** — a feature released for trial; its behaviour can change.
- **Coding agent** — an AI tool that writes code for a developer, such as Claude Code.
- **Stand note** — the short note on a ticket that says where the work stands: done, next, watch out.
- **`/poc`** — a short spike with throwaway code that answers one risky question.
- **D1** — the first entry in `DECISIONS.md`.
