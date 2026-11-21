# At-risk list

**Version:** v1 · **Status:** Refined · **Type:** Feature · **Project type:** Web UI

**Shape doc:** docs/specs/ticket-handover/shape.md
**Depends on:** stand-note, agent-checkpoint

A lead opens one page in a Jira project and sees each in-progress ticket that has no
stand note, or a note that is behind the last work. It ships now because a rule that tells
an agent to comment cannot do this part, so it carries the innovation score.

## Problem

A stand note helps only when it is there and current. Today nobody knows which tickets
have no note until a teammate is out and someone opens the ticket. A lead who wants to
check must open each in-progress ticket and expand the panel, one ticket at a time.

## Slice test

| Check                         | Result |
| ----------------------------- | ------ |
| Cuts every layer it needs     | yes — a project page, a backend call, Jira search, the note on each ticket, deployed on Forge |
| One e2e test walks it         | yes — open the page, read the two at-risk rows, save a note on one ticket, see the row leave |
| Worth shipping alone          | yes — a lead finds the tickets that would hand over badly, before a teammate is out |
| Fits (≤5 scenarios, ≤2 areas) | yes — 5 scenarios, two areas: the new project page and its backend call |

**Path:** full — a new page, and a new read across many tickets.

## User story

As a lead of a Jira project, I want one list of the in-progress tickets with no current
stand note, so that I ask for a note before the person is out.

## Flow

```mermaid
flowchart LR
    N((Nurul, lead)) -- "opens Stand notes in the Payments project" --> P[At-risk page]
    P -- "asks for in-progress tickets" --> J[(Jira project PAY)]
    J -- "Updated time and stand note of each ticket" --> P
    P -- "rows: No note, or note behind the last change" --> N
    N -- "selects PAY-150" --> T[Ticket PAY-150]
    T -- "Hafiz saves a note" --> J
```

Nurul opens the page in the Payments project, the page compares each in-progress ticket's
note with its last change, and she opens a ticket from a row.

## States

```mermaid
stateDiagram-v2
    [*] --> NotChecked: status is To Do or Done
    NotChecked --> NoNote: moves to In Progress, no note
    NotChecked --> Current: moves to In Progress, note is current
    NoNote --> Current: a person or an agent saves a note
    Current --> OutOfDate: the ticket changes more than 1 hour after the save
    OutOfDate --> Current: a person or an agent saves a note
    NoNote --> NotChecked: leaves In Progress
    Current --> NotChecked: leaves In Progress
    OutOfDate --> NotChecked: leaves In Progress
```

The page lists a ticket only in the states NoNote and OutOfDate.

## Acceptance criteria

```gherkin
Scenario: A lead sees the tickets at risk
  Given project Payments has these tickets on 2026-11-26 at 14:00
    | Key     | Summary                   | Status      | Assignee      | Note saved       | Updated          |
    | PAY-142 | Add refund endpoint       | In Progress | Aisyah Rahman | 2026-11-24 16:40 | 2026-11-26 09:10 |
    | PAY-150 | Add partial refunds       | In Progress | Hafiz Omar    | none             | 2026-11-26 11:00 |
    | PAY-151 | Fix the settlement report | In Review   | Aisyah Rahman | 2026-11-26 10:00 | 2026-11-26 10:20 |
    | PAY-155 | Add webhook retries       | To Do       | Hafiz Omar    | none             | 2026-11-25 15:00 |
    | PAY-139 | Rotate the sandbox keys   | Done        | Hafiz Omar    | none             | 2026-11-20 12:00 |
  And Nurul Huda can view project Payments
  When Nurul opens Stand notes in the Payments project
  Then the page says "2 of 3 in-progress tickets are at risk"
  And the first row shows PAY-150, "Add partial refunds", Hafiz Omar and "No note"
  And the second row shows PAY-142, "Add refund endpoint", Aisyah Rahman and "Note is 2 days behind"
  And the page has no row for PAY-151, PAY-155 or PAY-139

Scenario: A saved note takes the ticket off the list
  Given the page shows PAY-150 with "No note"
  When Nurul selects PAY-150 in the row
  Then Jira opens ticket PAY-150
  When Hafiz Omar saves a stand note on PAY-150
  And Nurul opens Stand notes in the Payments project again
  Then the page says "1 of 3 in-progress tickets are at risk"
  And the page has no row for PAY-150

Scenario: No ticket is at risk
  Given each in-progress ticket in project Payments has a stand note
  And no ticket changed more than 1 hour after its note was saved
  When Nurul opens Stand notes in the Payments project
  Then the page says "No ticket is at risk"
  And the page says "Each of the 3 in-progress tickets has a current stand note."

Scenario: The project has more than 100 in-progress tickets
  Given project Operations has 240 in-progress tickets
  And 37 of the 100 most recently updated tickets are at risk
  When Nurul opens Stand notes in the Operations project
  Then the page says "37 of 100 in-progress tickets are at risk"
  And the page says "Checked the 100 most recently updated of about 240 in-progress tickets."

Scenario: The list does not load
  Given Nurul can view project Payments
  When she opens Stand notes in the Payments project and Jira does not answer
  Then the page says "The list did not load. Reload the page."
  And the page shows no rows and no count
```

## Scope

**In:**

- A page named Stand notes in the row of tabs of each Jira project. It lists the tickets of
  that project only.
- The page checks each ticket whose status is in Jira's In Progress category. In Review
  counts, because Jira puts it in that category.
- A ticket is at risk when it has no stand note.
- A ticket is also at risk when Jira's Updated time is more than 1 hour after the note's
  saved time. Any change that Jira records counts: a comment, a field edit, a status move.
- Each row shows the ticket key, the summary, the assignee and the reason. The key opens
  the ticket. A ticket with no assignee shows "Unassigned".
- The reason is "No note", or how far the note is behind: "Note is 3 hours behind",
  "Note is 2 days behind".
- The order: tickets with no note first, the oldest Updated time on top. Then the notes
  that are behind, the largest gap on top.
- A count line above the rows, as in the scenarios.
- The page checks 100 tickets at most: the 100 most recently updated. It says so when the
  project has more, with a count that Jira gives as "about".
- A note that Stand Note did not sign counts by its saved time. Its row also says
  "saved outside Stand Note".
- Anyone who can view the project can open the page. Jira's own permissions hide each
  ticket that the person cannot view.
- The page loads the list once for each visit. A reload gets the new list.

**Out:**

- A warning in the Stand note panel that the note is behind — a new slice,
  `stale-note-warning`, after this one.
- Tickets from more than one project in one list — no slice yet.
- More than 100 tickets, with pages — no slice yet.
- A message to the assignee from the list — no slice yet.
- Filters, such as by assignee — no slice yet.
- A setting for the grace time or for the statuses — no slice yet.
- A scheduled report by email or chat — no slice yet.
- A production deploy and the install link for judges — `judge-ready-entry`.

## Interface

**Design system:** Forge UI Kit, as in `stand-note` (D3). The page adds no tokens and no
components of its own. UI Kit follows the Jira theme, light or dark.

**Motion tier:** 0. UI Kit gives the app no control of motion. The spinner is Atlassian's.

**Reference:** Jira's own work list, for one dense row for each ticket with the key as the
link. From Linear: colour only where it means something. Here the two lozenge colours are
the only colour on the page.

**Preview:** the wireframes below. UI Kit renders only inside Jira, so an HTML copy would
not show the real components. The build shows the real page on `dzaffren.atlassian.net`.

```mermaid
flowchart LR
    O["Person opens Stand notes in the project"] --> L[Loading]
    L -- "one or more tickets at risk" --> T["List: count line, rule line, table"]
    L -- "in-progress tickets, none at risk" --> E["Empty: No ticket is at risk"]
    L -- "no in-progress tickets" --> Z["Empty: No ticket is in progress"]
    L -- "Jira does not answer" --> X[Load error]
    T -- "selects a ticket key" --> I[Jira ticket view]
    T -- "more than 100 in progress" --> C["List, with the Checked line"]
```

A person opens the page, waits for one load, and gets the list, one of two empty views, or
the load error. A ticket key opens the ticket.

### Where the page is

- Module title: `Stand notes`. Jira shows it at the top of the page.
- The Forge docs say that a project page shows in the row of tabs of the project, next to
  Board and List. The build confirms the spot on the site (O11).

### List

```
Stand notes

2 of 3 in-progress tickets are at risk
A ticket is at risk when it has no stand note, or when it changed more than 1 hour
after its note was saved.

Ticket                          Assignee        Stand note                  Last change
PAY-150  Add partial refunds    Hafiz Omar      [ No note ]                 3 hours ago
PAY-142  Add refund endpoint    Aisyah Rahman   [ Note is 2 days behind ]   4 hours ago
PAY-147  Add refund webhooks    Unassigned      [ Note is 5 hours behind ]  20 min ago
                                                saved outside Stand Note
```

- The count line is a heading. The rule line under it is small, subtle text.
- Ticket: the key is a link that opens the ticket in the same tab. The summary is plain text.
- Assignee: the display name as plain text, or `Unassigned`.
- Stand note: a lozenge. `No note` is red. `Note is 2 days behind` is yellow.
- A note that Stand Note did not sign gets a second, small line: `saved outside Stand Note`.
- Last change: the age of Jira's Updated time, in the words of the panel: `20 min ago`,
  `3 hours ago`, `2 days ago`.
- The rows are in the order of O5. A person cannot sort the columns.
- All rows are on one page, 100 at most. The table has no pager.

### The Checked line

```
37 of 100 in-progress tickets are at risk
A ticket is at risk when it has no stand note, or when it changed more than 1 hour
after its note was saved.
Checked the 100 most recently updated of about 240 in-progress tickets.
```

The line shows only when the project has more than 100 in-progress tickets.

### The two empty views

```
            No ticket is at risk
   Each of the 3 in-progress tickets has a current stand note.

            No ticket is in progress
   The list checks the tickets whose status is in progress.
```

Each view takes the place of the count line, the rule line and the table.

### Loading and the load error

```
  (spinner)                                    label: Loading the at-risk list

  (!) The list did not load. Reload the page.  in place of the page content
```

**Components used:** Stack, Inline, Heading, Text, DynamicTable, Link, Lozenge, EmptyState,
SectionMessage, Spinner.

**The two craft checks.** A one-line prompt gives a table of all tickets with a status
column. This page lists only the tickets that need a note, says how many of how many, and
puts the ticket to chase first on top. Next to Jira's work list it has the same row rhythm,
and the lozenge is the only colour.

## Technical plan

### Approach

The app gets a second module, a `jira:projectPage` in UI Kit. The page calls one new
resolver function, `getAtRisk`. That function runs one Jira search as the person and gets
each in-progress ticket with its stand note in the same answer.

The function works out the rows on the server and sends only the rows to the browser. It
takes the project from the Forge context. The browser sends no input.

A probe on `dzaffren.atlassian.net` on 2026-11-21 proved three things. `POST
/rest/api/3/search/jql` with `properties: ["stand-note"]` returns the note of each ticket.
The answer has no total, and `POST /rest/api/3/search/approximate-count` gives one. A save
of the note does not change Jira's Updated time.

Relies on: D2, D4, D5, D6, D7, D9, D13, and D16 to D20 drafted here.

```mermaid
flowchart TB
    subgraph browser["Browser: Jira project view"]
        UI["Stand notes page (src/frontend/at-risk.jsx)"]
    end
    subgraph forge["Forge functions"]
        RES["resolver getAtRisk (src/resolvers/index.js)"]
        LIB["riskRows (src/lib/risk.js), behindLabel (src/lib/age.js), isSigned (src/lib/signature.js)"]
    end
    subgraph jira["Jira Cloud"]
        SEARCH["search/jql: in-progress tickets with property stand-note"]
        COUNT["search/approximate-count"]
    end
    UI -- "invoke getAtRisk, no input" --> RES
    RES -- "rows, checked, inProgress, now" --> UI
    RES -- "POST as the person, project key from the context" --> SEARCH
    RES -- "POST as the person, only when the search has more" --> COUNT
    RES -- "tickets and notes" --> LIB
    LIB -- "at-risk rows in order" --> RES
```

The page talks only to the resolver, the resolver asks Jira as the person, and the helpers
turn the tickets into rows.

```mermaid
sequenceDiagram
    participant U as Nurul
    participant P as Stand notes page
    participant R as resolver getAtRisk
    participant J as Jira REST API
    U->>P: opens Stand notes in project PAY
    P->>R: invoke getAtRisk
    R->>J: POST search/jql (project PAY, statusCategory In Progress, updated DESC, 100, properties stand-note)
    J-->>R: issues, isLast
    opt isLast is false
        R->>J: POST search/approximate-count (same JQL)
        J-->>R: count
    end
    R->>R: riskRows: no note, or Updated more than 1 hour after savedAt
    R-->>P: rows, checked, inProgress, now
    P-->>U: "2 of 3 in-progress tickets are at risk" and the table
```

```mermaid
flowchart LR
    C["Forge context: project key"] -- "trusted, set by Jira" --> R["getAtRisk"]
    J[("Jira: summary, assignee, Updated, property stand-note")] -- "only tickets that the person can view" --> R
    R -- "key, summary, assignee name, reason, gap, Updated" --> V["Page, shown as plain text"]
    R -. "note texts stay on the server" .-> X["not sent"]
```

Jira filters the tickets for the person, and the page gets the row fields but not the note
texts.

### Changes

| File | What changes | Why |
| ---- | ------------ | --- |
| `manifest.yml:2` | A new `jira:projectPage` module `stand-notes-page`: title `Stand notes`, `render: native`, resource `at-risk`, resolver function `resolver`. | All scenarios, D16 |
| `manifest.yml:71` | A new resource `at-risk` with path `src/frontend/at-risk.jsx`. | All scenarios |
| `src/lib/risk.js` (new) | `GRACE_MS`, `MAX_CHECKED`, and `riskRows(issues, isSigned)`. It cleans each note with `cleanNote`, drops the current tickets, and sorts the rest in the order of O5. A note with no valid `savedAt` counts as no note. | Scenarios 1, 2, 3 |
| `src/lib/age.js:1` | `plural` loses its " ago", and `ageLabel` adds it. A new `behindLabel(gapMs)` gives "Note is 3 hours behind" with the same hour and day rounding. | Scenario 1 |
| `src/resolvers/index.js:33` | A new `projectKeyOf(context)` next to `issueKeyOf`. A new `getAtRisk`: the search, the count when the search has more, `riskRows`, one log line. | Scenarios 1 to 5 |
| `src/resolvers/index.js:70` | `resolver.define('getAtRisk', getAtRisk)`. | All scenarios |
| `src/frontend/at-risk.jsx` (new) | The page: spinner, load error, the two empty views, the count line, the rule line, the Checked line and the table. It formats Last change with `ageLabel`. | All scenarios |
| `test/risk.test.js` (new) | `riskRows`: no note, a note behind, the 1 hour edge, the order, a note that is not signed, a note with a bad `savedAt`. | Scenarios 1, 3 |
| `test/age.test.js` | `behindLabel`, and `ageLabel` after the `plural` change. | Scenario 1 |
| `test/resolvers.test.js:4` | The fake Jira answers the two search calls. Tests for `getAtRisk`: the table of scenario 1, none at risk, 100 of about 240, Jira's refusal, the project key from the context. | Scenarios 1, 3, 4, 5 |
| `e2e/setup-site.mjs:30` | Makes the project `SNR` "At-risk tests" once, with the site's default permission scheme. | D20 |
| `e2e/jira.js:25` | New helpers: `moveTo(issueKey, statusName)` and `touch(issueKey)`, which changes the description so that Updated is now. | Scenario 1 |
| `e2e/at-risk-list.spec.js` (new) | Scenarios 1, 2, 3 and 5 on project `SNR`. | Test plan |
| `README.md`, `docs/ARCHITECTURE.md` | One line for the page, and the page in the two diagrams. | The docs stay true |

Reusing: `cleanNote` and `PROPERTY_KEY` (`src/lib/note.js`), `isSigned`
(`src/lib/signature.js:14`), `ageLabel` (`src/lib/age.js:5`), the resolver pattern of
`getNote`, the fake Jira of `test/resolvers.test.js`, `findOrCreateIssue`, `setNote` and
`deleteNote` (`e2e/jira.js`), and the `page.route` block of `e2e/stand-note.spec.js:110`.

The JQL is `project = "<key>" AND statusCategory = "In Progress" ORDER BY updated DESC`. The
search asks for the fields `summary`, `assignee` and `updated`, and 100 results at most.

`getAtRisk` returns this to the page:

```json
{
  "rows": [
    { "key": "PAY-150", "summary": "Add partial refunds", "assignee": "Hafiz Omar", "updated": "2026-11-26T03:00:00.000Z", "gapMs": null, "outside": false },
    { "key": "PAY-142", "summary": "Add refund endpoint", "assignee": "Aisyah Rahman", "updated": "2026-11-26T01:10:00.000Z", "gapMs": 145800000, "outside": false }
  ],
  "checked": 3,
  "inProgress": 3,
  "now": "2026-11-26T06:00:00.000Z"
}
```

A row with `gapMs: null` has no note. `inProgress` is `checked` when the search has no more
tickets, and Jira's count when it has.

### Earn-it

| Added | Triggered by |
| ----- | ------------ |
| `jira:projectPage` module and the resource `at-risk` | Scenario 1: the lead needs a page outside a ticket. |
| `getAtRisk` in the resolver | Scenario 1: the signature check needs `NOTE_SIGNING_KEY`, which is server only. The server also gives the time for "Last change" (D9). |
| `src/lib/risk.js` | The rule and the order need unit tests apart from Forge, as `note.js` and `age.js` have. |
| The `approximate-count` call | Scenario 4: the search answer has no total. The call runs only when the project has more than 100. |
| Project `SNR`, `moveTo`, `touch` | Scenario 1: "2 of 3" is exact only when the test owns each in-progress ticket (D20). |

No new dependency. No new scope: `forge lint` names a missing scope, and the build runs it.

### Non-functionals

|                      |     |
| -------------------- | --- |
| **Load**             | One search call for each visit of the page, and one count call when the project has more than 100 in-progress tickets. A lead opens the page some times a day. One answer holds 100 tickets with notes of 4,200 characters at most, so about 500 kB at most. |
| **Breaks first**     | At 10 times the load, nothing in the app. Jira's rate limit for REST calls is the first limit, and the page then shows the load error. The time of a search of 100 tickets is not measured. |
| **Security surface** | Callers: a person who can open the project. The search runs as that person, so Jira leaves out each ticket that they cannot view. The project key comes from the Forge context, not from the browser. Input from the browser: none. Output: key, summary, assignee name, gap and Updated time, shown as plain text. The note texts do not leave the server. Secrets: `NOTE_SIGNING_KEY`, read on the server for the signature check. Stored: nothing new. |
| **Proof it works**   | `forge logs -e development` shows `at-risk list project=PAY checked=3 atRisk=2` after a visit. |
| **Rollout**          | No flag. The app is on the developer's own site only, in the development environment. Rollback is `forge deploy` of the commit before. The page stores nothing, so a rollback leaves nothing behind. |

### Test plan

The e2e test runs on project `SNR`. The main account sets the notes through the Jira API,
so those notes are not signed, and their rows say "saved outside Stand Note". The unit
tests cover the signed notes. Jira does not let a test set the Updated time, so the test
saves a note with `savedAt` two days back and then calls `touch`.

| Scenario | Test | Command |
| -------- | ---- | ------- |
| 1 A lead sees the tickets at risk | `e2e/at-risk-list.spec.js` "lists the tickets at risk" · `test/risk.test.js` · `test/age.test.js` · `test/resolvers.test.js` | `npm run e2e` · `npm test` |
| 2 A saved note takes the ticket off the list | `e2e/at-risk-list.spec.js` "a saved note takes the ticket off the list". The key opens the ticket, and the main account then saves a note through the API. | `npm run e2e` |
| 3 No ticket is at risk | `e2e/at-risk-list.spec.js` "no ticket is at risk" · `test/resolvers.test.js` "getAtRisk gives no rows" | `npm run e2e` · `npm test` |
| 4 More than 100 in-progress tickets | `test/resolvers.test.js` "getAtRisk checks 100 and gives Jira's count". No e2e test (O14). | `npm test` |
| 5 The list does not load | `e2e/at-risk-list.spec.js` "shows the load error". Playwright refuses the `getAtRisk` call. · `test/resolvers.test.js` "getAtRisk passes on Jira's refusal" | `npm run e2e` · `npm test` |

Other commands: `npm run lint`, `npm run deploy`, and `npm run e2e:setup` once for `SNR`.

**E2E:** `e2e/at-risk-list.spec.js`, after `npm run deploy`. The harness is there from
`stand-note`. The new work is the project `SNR` and the two helpers.

### Chunks

Single chunk. The e2e test needs the deployed app, and `manifest.yml` and
`src/resolvers/index.js` are shared by each part.

### Risks

| Risk | Mitigation |
| ---- | ---------- |
| A Lozenge does not render inside a DynamicTable cell (O12). The docs show only a Link in a cell. | The cell shows the same words as plain text. |
| A Link with `/browse/PAY-150` does not open the ticket from a project page (O12). | The key calls `router.navigate` from `@forge/bridge`, which is in the app. |
| The resolver of a project page does not get `context.extension.project.key` (O12). The docs name the field for the page, not for the resolver. | The build logs the context once. `project.id` works in the JQL too. |
| Jira puts the page under "More" in the row of tabs, and the e2e test does not find it (O11). | The test opens the page by its URL, `/jira/software/c/projects/SNR/apps/<appId>/<envId>`, read once from the browser. |
| Jira's count is "about", so the Checked line can be off by a few (O13). | The line says "about". The count shows only for a project with more than 100. |
| This branch starts from `feat/agent-checkpoint`, which is not in `main` yet. | Merge `feat/stand-note` and `feat/agent-checkpoint` first, then rebase this branch on `main`. |
| A hand edit of a ticket in `SNR` changes the counts of the e2e test. | The test sets the status and the note of each `SNR` ticket at its start. |

### Decisions to record

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

## Open items

| ID  | What | Type | Raised at | Owner | Status | Answer |
| --- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1  | Where does the lead open the page? | question | spec p1 | user | Resolved | A project page in the sidebar of each Jira project. It lists that project's tickets only. A global page and a dashboard gadget were the other choices. 2026-11-21 |
| O2  | Which tickets count as in progress? | question | spec p1 | user | Resolved | Each ticket whose status is in Jira's In Progress category. 2026-11-21 |
| O3  | What counts as the last work on a ticket? | question | spec p1 | user | Resolved | Jira's Updated time. Any change that Jira records counts. 2026-11-21 |
| O4  | How much later must the work be before the note is out of date? | question | spec p1 | user | Resolved | More than 1 hour. An agent often saves the note and then moves the ticket. 2026-11-21 |
| O5  | What order are the rows in? | question | spec p1 | user | Resolved | No note first, the oldest Updated time on top. Then the notes that are behind, the largest gap on top. 2026-11-21 |
| O6  | How many tickets does the page show? | question | spec p1 | user | Resolved | It checks 100 in-progress tickets at most, and gives the count when there are more. Paging is out. 2026-11-21 |
| O7  | Who can open the page? | question | spec p1 | user | Resolved | Anyone who can view the project. Jira's permissions hide each ticket that the person cannot view. The app has no lead role. 2026-11-21 |
| O8  | How does the list treat a note that Stand Note did not sign? | question | spec p1 | user | Resolved | It counts by its saved time, and the row says "saved outside Stand Note". 2026-11-21 |
| O9  | Which 100 tickets does the page check when the project has more? | question | spec p1 | user | Resolved | The 100 most recently updated. 2026-11-21 |
| O10 | The `stand-note` spec left "a warning that work moved after the note was saved" to this slice. Does the ticket panel show it too? | question | spec p1 | user | Resolved | No. This slice ships the list only. The panel warning is a new slice, `stale-note-warning`. 2026-11-21 |
| O11 | Pause 1 says the page is in the sidebar of the project. The Forge docs say that a `jira:projectPage` shows in the row of tabs of the project. Nobody saw it on the site yet. | flag | spec p2 | user | Resolved | The row of tabs is fine. The scenarios now say "in the Payments project", and the build confirms the spot on the site. 2026-11-21 |
| O12 | The page rests on UI Kit pieces that nobody saw on the site: a Lozenge and a Link inside DynamicTable cells, a link that opens `/browse/PAY-150`, and the project key in the resolver context of a project page. | unproven | spec p3 | user | Accepted risk | The build finds out. Each piece has a fallback in Risks: plain text, `router.navigate`, and `project.id`. Accepted 2026-11-21 |
| O13 | Jira's search gives no total. The count in the Checked line comes from `search/approximate-count`, which Jira does not promise is exact. | flag | spec p3 | user | Resolved | The line says "of about 240". Scenario 4 changed by one word. 2026-11-21 |
| O14 | An e2e test of scenario 4 needs 101 or more in-progress tickets on the site. | flag | spec p3 | user | Accepted risk | A unit test feeds `getAtRisk` a search of 100 tickets and a count of 240. No e2e test and no hand walk. Accepted 2026-11-21 |
| O15 | Which project does the e2e test use, so that "2 of 3" is exact? | question | spec p3 | user | Resolved | A new project `SNR`, made once by `e2e/setup-site.mjs`. Drafted as D20. 2026-11-21 |

_Never delete this section or its rows. See references/ledger.md._

## Glossary

- **Stand note** — the short note on a ticket that says where the work stands: done, next, watch out.
- **At risk** — an in-progress ticket with no stand note, or with a note that is behind the last change.
- **Lead** — the person who watches the work of a team or a Jira project.
- **Project page** — a page that a Forge app adds to the row of tabs of a Jira project.
- **Status category** — Jira's three groups of statuses: To Do, In Progress and Done.
- **Updated time** — the time of the last change that Jira recorded on a ticket.
- **Grace time** — the 1 hour after a save in which a change does not make the note out of date.
- **Signed note** — a note that Stand Note saved. The app marks it, so a read can tell it from a note written through Jira's API.
- **Forge** — Atlassian's platform for apps that run inside Jira and its other products.
- **UI Kit** — Forge's set of ready-made screen parts, such as tables and buttons.
- **Resolver** — the backend part of a Forge app that the screen calls.
- **Module** — one place where a Forge app adds something to Jira, such as a panel or a page.
- **JQL** — Jira Query Language, the text that a Jira search takes.
- **Jira issue property** — a small piece of data that an app attaches to one ticket.
- **Lozenge** — Atlassian's name for a small coloured tag.
- **DynamicTable** — the table part of UI Kit.
- **Probe** — a read-only call to the real site that checks one fact.
- **`/poc`** — a short spike with throwaway code that answers one risky question.
- **Vitest** — a tool that runs unit tests for JavaScript.
- **Playwright** — a tool that drives a real browser from a test.
- **e2e** — end to end. An e2e test uses the app as a user does.
