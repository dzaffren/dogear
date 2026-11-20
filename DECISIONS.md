# Decisions

Append-only. A changed decision is a new entry that supersedes the old one; only an
old entry's Status line ever changes.

## D1 · 2026-11-20 · Aim for the Atlassian MCP bonus prize

Why: one entry can win only one bonus prize ($1,500). The team works with Claude Code
and the Atlassian MCP every day, and slice 1 (agent checkpoint) qualifies with no extra
work.
Rejected: Rovo agent (rests on the optional pick-up brief), Marketplace listing (review
process not read yet), Teamwork Graph (no slice needs it).
Source: docs/specs/ticket-handover/shape.md
Status: active

## D2 · 2026-11-20 · Write the Forge app in JavaScript

Why: the Forge docs say "Forge apps are written in JavaScript", and each tutorial uses
it. This is the developer's first Forge app.
Rejected: TypeScript (the docs name a deploy error, TS2304, that needs a workaround).
Source: docs/specs/stand-note.md
Status: active

## D3 · 2026-11-20 · UI Kit for the stand-note panel

Why: the note form needs a form, four text fields and a button, and UI Kit has them
with the Jira look. The choice is per module, so a later screen can use Custom UI.
Rejected: Custom UI (more code, and it needs a design system of our own first).
Source: docs/specs/stand-note.md
Status: active

## D4 · 2026-11-20 · Keep the stand note as a Jira issue property

Why: Jira's own permissions decide who reads and writes the note, Jira deletes it with
the ticket, and Jira search can find tickets by it for the at-risk list.
Rejected: Forge key-value store (the app must check permissions itself, and the at-risk
list must join two sources), Forge SQL (a database for one note per ticket).
Source: docs/specs/stand-note.md
Status: active

## D5 · 2026-11-20 · npm as the package manager

Why: the Forge docs and the Forge CLI assume npm.
Rejected: pnpm (not tested with `forge deploy`), yarn (not tested with `forge deploy`).
Source: docs/specs/stand-note.md
Status: active

## D6 · 2026-11-20 · Vitest for unit tests, Playwright for e2e tests

Why: Forge has no official test tools. Playwright walks the real Jira site as a user
does, and Vitest runs the unit tests in seconds.
Rejected: Jest (slower than Vitest), a hand walk in place of Playwright (no automated
proof that the slice works).
Source: docs/specs/stand-note.md
Status: active

## D7 · 2026-11-20 · No CI

Why: one developer has 32 days, and the judges do not look at CI. The tests run by hand
before each deploy.
Rejected: GitHub Actions (setup time and a hosted repo, for no gain with the judges),
GitLab CI (the same).
Source: docs/specs/stand-note.md
Status: active

## D8 · 2026-11-20 · The stand note sits in the issue context spot

Why: the spike proved that this spot shows on each ticket with no setup, also to a person
who can view the ticket but cannot edit it. Its collapsed header can carry a tag for each
ticket.
Rejected: the issue panel in the main column (a person adds it to each ticket with a button
that only editors see, or a Jira admin switches it on for the site, and it is not proved for
a view-only person).
Source: docs/specs/stand-note.md
Status: active
