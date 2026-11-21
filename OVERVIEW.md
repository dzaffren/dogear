# CodegeistHackathon

**Status:** Active · **Updated:** 2026-11-21 by /ship agent-checkpoint

A Forge app for Jira that keeps a short, current note of where the work on a ticket
stands. A teammate who picks up the ticket carries on from that note. An entry for
Codegeist 2026, which closes on 2026-12-22 at 12:00 Pacific Time.

## Run it

| Task    | Command          |
| ------- | ---------------- |
| install | `npm install`    |
| run     | `npm run deploy` |
| test    | `npm test`, then `npm run e2e` after a deploy |
| lint    | `npm run lint`   |

## Where things are

- `docs/specs/` — the shape of each idea, and the spec of each slice
- `src/` — the Forge app: the panel in `src/frontend/`, the resolver in `src/resolvers/`,
  the agent's MCP tools in `src/tools/`
- `test/` — Vitest unit tests · `e2e/` — Playwright tests on the real Jira site

## Slices

| Slice      | Status  | What it does | Page |
| ---------- | ------- | ------------ | ---- |
| stand-note | Shipped | A person saves a short note on a Jira ticket that says where the work stands, and anyone who opens the ticket reads it. | none |
| agent-checkpoint | Shipped | A coding agent such as Claude Code saves the stand note on a Jira ticket as it works, and a second agent reads the note and carries on. | none |

## More

README.md · docs/ARCHITECTURE.md · DECISIONS.md · CHANGELOG.md
