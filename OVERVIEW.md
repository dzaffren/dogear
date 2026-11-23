# Dogear

**Status:** Active · **Updated:** 2026-11-23 by /ship dogear-brand

Dogear is a Forge app for Jira. It keeps a dogear on each ticket: a short, current note of
where the work stands. A teammate who picks up the ticket carries on from it. An entry for
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
- `src/` — the Forge app: the panel and the Dogears page in `src/frontend/`, the resolver
  in `src/resolvers/`, the agent's MCP tools in `src/tools/`
- `test/` — Vitest unit tests · `e2e/` — Playwright tests on the real Jira site

## Slices

| Slice      | Status  | What it does | Page |
| ---------- | ------- | ------------ | ---- |
| stand-note | Shipped | A person saves a dogear on a Jira ticket, a short note that says where the work stands, and anyone who opens the ticket reads it. | none |
| agent-checkpoint | Shipped | A coding agent such as Claude Code saves the dogear on a Jira ticket as it works, and a second agent reads it and carries on. | none |
| at-risk-list | Shipped | A lead opens one page in a Jira project and sees each in-progress ticket that has no dogear, or a dogear that is behind the last work. | none |
| pick-up-brief | Shipped | A person opens a ticket with no dogear, selects one button, and gets a brief that AI builds from what Jira has. | none |
| dogear-brand | Shipped | The app and its note get one name, Dogear, with a logo and one brand kit for the guide, the Devpost entry and the video. | none |

## More

README.md · docs/ARCHITECTURE.md · DECISIONS.md · CHANGELOG.md
