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

## D9 · 2026-11-20 · The panel loads and saves through a resolver

Why: the server stamps the author and the time, so "2 days ago" is right on each person's
machine, and the server takes the ticket from the Forge context.
Rejected: Jira calls straight from the panel (the browser's clock and the browser's word
for the author).
Source: docs/specs/stand-note.md
Status: active

## D10 · 2026-11-20 · A separate view-only project for the e2e tests

Why: scenario 4 needs a person who cannot edit, and the site's default scheme lets each
logged-in user edit. A project with its own scheme keeps Payments and Operations as they are.
Rejected: a switch of the shared scheme in each test run (a run that stops halfway leaves two
projects read-only for the test account).
Source: docs/specs/stand-note.md
Status: active

## D11 · 2026-11-20 · The form keeps its fields in React state

Why: Save is disabled while all four fields are empty, and Cancel puts the saved text back.
The UI Kit docs say that `useForm` cannot watch values, set them or clear them.
Rejected: the `useForm` hook (it cannot watch or reset the fields).
Source: docs/specs/stand-note.md
Status: active

## D12 · 2026-11-21 · The agent saves through the app's own MCP tools

Why: the spike proved that Claude Code reaches a `rovo:mcp` tool of the app, and the
tool writes the issue property as the caller. One tool call saves the whole note, and
the app checks the note before the write.
Rejected: the built-in Atlassian MCP tools with a comment that the app reads (the note
moves out of the issue property of D4, and the app cannot refuse a bad note).
Source: docs/specs/agent-checkpoint.md
Status: active

## D13 · 2026-11-21 · The agent's tools call Jira as the person

Why: Jira's own permissions then decide who saves and who reads a note (D4), and the
author is the person. The spike proved that this works after one Allow access in the panel.
Rejected: calls as the app (they work with no consent, but the app must check the view
and edit permissions itself, and Jira sees the app as the writer).
Source: docs/specs/agent-checkpoint.md
Status: active

## D14 · 2026-11-21 · A rule text tells the agent when to save

Why: a block in `CLAUDE.md` or `AGENTS.md` needs no build, and it works in each agent
that reads such a file.
Rejected: a Claude Code hook (more build, and it works only in Claude Code), the tools
alone (the note goes missing when the person forgets to ask).
Source: docs/specs/agent-checkpoint.md
Status: active

## D15 · 2026-11-21 · The e2e test calls the MCP tools with the MCP SDK and a saved login

Why: the test then calls the same endpoint as an agent, with the same result on each run.
Atlassian's OAuth server lets a client register itself and gives refresh tokens.
Rejected: `claude -p` inside the test (a model in each run: slow, not free, and not the
same each time), a hand walk only (no automated proof of scenarios 1 to 4).
Source: docs/specs/agent-checkpoint.md
Status: active

## D16 · 2026-11-21 · The at-risk list is a project page

Why: a lead watches one project or team, and a project page needs no setup by the lead.
It lists the tickets of that project only.
Rejected: a global page (one list for all projects, which no lead owns), a dashboard gadget
(the lead must make a dashboard first, and a judge may have none).
Source: docs/specs/at-risk-list.md
Status: active

## D17 · 2026-11-21 · A note is behind when Jira's Updated time is more than 1 hour after the save

Why: Jira has the Updated time on each ticket, and it counts each change. An agent often
saves the note and then moves the ticket, so a change in the first hour does not count.
A save of the note does not change the Updated time (probe, 2026-11-21).
Rejected: only comments and status moves (a second read of the history for each ticket),
only changes by the assignee (misses the work of a pair or of an agent), no grace time
(most agent saves show as behind at once), a grace time of 1 day (misses a handover in the
same afternoon).
Source: docs/specs/at-risk-list.md
Status: active

## D18 · 2026-11-21 · The list reads the notes through Jira search with the `properties` field

Why: one search call returns each in-progress ticket with its note (probe, 2026-11-21).
The server then compares the two times, which JQL cannot do.
Rejected: JQL on an indexed property through `jira:entityProperty` (JQL cannot compare the
saved time with the Updated time, and it needs an index module), one property read for
each ticket (101 calls for one visit).
Source: docs/specs/at-risk-list.md
Status: active

## D19 · 2026-11-21 · UI Kit for the Stand notes page

Why: the page is one table with a heading, two empty views and an error, and UI Kit has
each of them with the Jira look. D3 left the choice open for each module.
Rejected: Custom UI (more code, and it needs a design system of our own first).
Source: docs/specs/at-risk-list.md
Status: active

## D20 · 2026-11-21 · A separate project, SNR, for the at-risk e2e test

Why: "2 of 3 in-progress tickets are at risk" is exact only when the test owns each
in-progress ticket of the project. The setup script makes the project once, as for SNV (D10).
Rejected: Payments (hand work and the other tests change its in-progress tickets, so the
test must move them on each run).
Source: docs/specs/at-risk-list.md
Status: active
