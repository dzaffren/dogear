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

## D21 · 2026-11-21 · The brief's text comes from Forge LLM, in the panel

Why: the brief then shows where the person already looks, in the Stand note panel, and
it works on a site with no Rovo. Atlassian's docs say Forge LLM is open to all apps and
keeps the Runs on Atlassian badge. One brief costs about 1 US cent with Claude Haiku.
Rejected: a Rovo agent in chat (the docs give no backend call, so the brief shows in the
chat sidebar, the site needs Rovo, and `rovo.open` is in Preview), no generated text (a
list of facts from Jira, with no Done and Next written for the reader).
Source: docs/specs/pick-up-brief.md
Status: active

## D22 · 2026-11-21 · A brief builds only on a button

Why: each brief costs money, and a person who opens the panel to write a note needs no
brief.
Rejected: a brief by itself when the panel opens (one paid call for each open of a ticket
with no note).
Source: docs/specs/pick-up-brief.md
Status: active

## D23 · 2026-11-21 · The app does not keep the brief

Why: the next person gets a brief of Jira as it is then, and the app stores nothing new on
the ticket. The ticket stays "No note" in the at-risk list until a person saves a note.
Rejected: a brief kept on the ticket (it can be behind the ticket, and a view-only person
cannot write to the ticket, so the app must write as itself, against D13).
Source: docs/specs/pick-up-brief.md
Status: active

## D24 · 2026-11-21 · A brief becomes the stand note only through the form

Why: a person reads and corrects the text before the save, so a person stands behind each
stand note.
Rejected: a save of the brief in one click (generated text then looks like a person's
note), a read-only brief (the person types the note from nothing).
Source: docs/specs/pick-up-brief.md
Status: active

## D25 · 2026-11-21 · A site builds 50 briefs a day at most

Why: the developer pays for each brief, also on a judge's site. 50 briefs cost about 50 US
cents a day for each site at most.
Rejected: no limit (the button is the only brake on the cost), 20 a day (a judge with a
busy demo site can reach it), 100 a day (about 1 US dollar a day for each site).
Source: docs/specs/pick-up-brief.md
Status: active

## D26 · 2026-11-23 · The brief reads the ticket through Jira's REST API v2

Why: v2 gives the description and each comment as plain text (probe, 2026-11-23), which is
what the model reads. The app needs no code that turns Jira's document format into text.
Rejected: v3 for the description and the comments (it gives Atlassian Document Format, so
the app must walk each document to get its text).
Source: docs/specs/pick-up-brief.md
Status: active

## D27 · 2026-11-23 · The daily count is a read and then a write in the key-value store

Why: the limit is a cost brake. Two briefs in the same second can count as one, and a few
briefs over 50 cost a few cents.
Rejected: one numbered slot for each brief, with a write that fails when the slot is taken
(exact, but more code and more store calls for each brief).
Source: docs/specs/pick-up-brief.md
Status: active

## D28 · 2026-11-23 · No test calls the real model, and the build makes one brief by hand

Why: a real call costs about 1 US cent a run, adds 1 to the site's count, and gives other
words each time. One hand check after the deploy proves the `llm` module, the store and
the model together.
Rejected: one real call in each e2e run (cost, the count, and words that change), no check
of the deployed chain (a wrong scope or module shows first to a user).
Source: docs/specs/pick-up-brief.md
Status: active

## D29 · 2026-11-23 · One word, Dogear, for the app and for its note

Why: a judge installs "Dogear" and then looks for that word on the ticket and in the
agent's tools. With one word, the install screen, the panel, the tab and the tools name the
same thing.
Rejected: a new name for the app alone, with "stand note" for the note (two words for one
product, and a judge who installs Dogear looks for a panel named "Stand note"), new titles
only (the panel's title says Dogear, and the text under it says "stand note").
Source: docs/specs/dogear-brand.md
Status: active

## D30 · 2026-11-23 · The logo is Page pup, in Ginger

Why: Page pup shows both halves of the name in one shape: the folded corner of the page is
the dog's ear. A face from the front reads at a glance, and its small cut holds at 16
pixels. Ginger `#E55F12` is far from Atlassian's blue.
Rejected: Folded d (a page and a letter, with no dog, so it is the cooler mark), Origami pup
(its ears blur at 16 pixels), the three concepts of round 1 (Fold-ear can read as a camera,
Folded D has no dog, Corner reads as an arrow).
Source: docs/specs/dogear-brand.md
Status: active

## D31 · 2026-11-23 · The icon in Jira is a PNG at a public web address

Why: the docs call the panel's icon "the absolute URL of the icon", and they describe a
folder of bundled files only for Custom UI. A web address needs no spike. The address works
when the repo is public, so `judge-ready-entry` adds it.
Rejected: a bundled icon file (not proven for a UI Kit app, and it needs a spike first), no
icon in Jira (the panel and the tab keep the generic icon for good).
Source: docs/specs/dogear-brand.md
Status: superseded by D38

## D32 · 2026-11-23 · The judge's worked example is a guide, with no sample-ticket button

Why: the guide gives the text of one ticket, and that ticket shows the Dogears tab, the
brief and the dogear. The app gets no new code before the deadline.
Rejected: a button that makes sample tickets (new code that writes tickets to the site of a
stranger, and one more thing to test in production).
Source: docs/specs/judge-ready-entry.md
Status: active

## D33 · 2026-11-23 · The rehearsal runs on a new site of a second account

Why: a judge is not the developer of the app. Only a second account shows what a stranger
sees at the install, at the consent and at the first brief.
Rejected: a second site of the developer's account (the developer owns the app, so the
install can differ), no clean site (nobody tests a first install).
Source: docs/specs/judge-ready-entry.md
Status: active

## D34 · 2026-11-23 · The repo becomes public, with the skill file in it

Why: the text of the MCP bonus prize names open-source `skill.md` files for third-party
agents. One public repo holds the app and the skill file, and a judge can read the code.
Rejected: a small public repo with only the skill file (two repos, and the skill file can
drift from the app), the block in the guide only (nothing is open source).
Source: docs/specs/judge-ready-entry.md
Status: active

## D35 · 2026-11-23 · The judge's guide is GUIDE.md at the repo root

Why: a judge and a developer need different pages. One file for the judge takes one link
from the Devpost entry, and the README keeps its generated block.
Rejected: the judge's parts at the top of the README (one file for two readers), the steps
only in the Devpost text (the repo has no guide, and a change after the deadline is not
possible).
Source: docs/specs/judge-ready-entry.md
Status: active

## D36 · 2026-11-23 · The skill file is skills/dogear/SKILL.md

Why: Claude Code loads this folder form as a skill, so a judge adds it with one copy. The
guide gives the same rule text as a block for other agents.
Rejected: a plain `skill.md` at the repo root (no agent loads it as it is; a person pastes
its text).
Source: docs/specs/judge-ready-entry.md
Status: active

## D37 · 2026-11-24 · The history of main gets the noreply author, by a force-push

Why: commits have the developer's private email address as the author, and a public repo
shows it. A force-push takes the address out of `main` and keeps the repo, its name and
its pull requests.
Rejected: a new public repo with a clean history (the address is gone for good, but the
pull requests stay behind in a private repo), no rewrite (the address is on `main`).
Source: docs/specs/judge-ready-entry.md
Status: active

## D38 · 2026-11-23 · The icon in Jira is a bundled SVG file

Why: a spike showed that a UI Kit app can bundle its icon: a resource with the folder
`static/icons`, and `icon: resource:icons;dogear.svg` on the panel and on the tab. The icon
needs no public repo, it is in the first production deploy, and an SVG stays sharp.
Rejected: a PNG at a public web address (it works only when the repo is renamed and public,
and nobody tried it), no icon in Jira (the panel and the tab keep the generic icon).
Supersedes: D31
Source: docs/specs/judge-ready-entry.md
Status: active

## D39 · 2026-11-24 · The agent asks before it picks up a ticket from the list

Why: a ticket on the list often has another person as its assignee, and the person should
choose what their agent takes on. The skill shows the list and asks which ticket to start.
Rejected: start on the top ticket (it takes another person's work with no word), start
alone only on a ticket with no assignee (two rules where one does).
Source: docs/specs/agent-pickup.md
Status: active

## D40 · 2026-11-24 · The agent's at-risk list has no note texts

Why: the agent reads the dogear of the one ticket that the person picks, with `get-dogear`.
Each line stays short, as on the Dogears tab, which keeps the texts on the server.
Rejected: each line with its Next (up to 1,000 more characters a line in the agent's
context).
Source: docs/specs/agent-pickup.md
Status: active
