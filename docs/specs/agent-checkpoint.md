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

## Open items

| ID  | What | Type | Raised at | Owner | Status | Answer |
| --- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1  | An outside agent such as Claude Code can call this app's tools through the Atlassian MCP server and save a note on a ticket. The `rovo:mcp` module is in Preview. The Forge docs say a site admin turns on outside access, and the endpoint is `https://mcp.atlassian.com/forge/<appId>`. One community post says the Preview serves only Rovo agents. (from shape O5) | unproven | shape | poc | Open | — |
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
