# Agent pickup

**Version:** v1 · **Status:** Built · **Type:** Feature · **Project type:** Web UI

**Shape doc:** docs/specs/ticket-handover/shape.md
**Depends on:** agent-checkpoint, at-risk-list, judge-ready-entry

A coding agent asks Dogear which tickets of a project have no dogear, or one that is
behind the work, and then picks one up from its dogear. It ships before `submit-entry`
because the video needs the one thing that a rule telling the agent to comment cannot do.

## Problem

The agent's two tools read and save the dogear of a ticket that the person already knows.
The at-risk list finds the tickets whose handover is missing or out of date, but only a
person in Jira sees it. An agent cannot ask "which ticket in PAY needs me?", so the two
parts of Dogear that no other tool has stay apart.

A judge of Codegeist 2026 scored innovation 3 of 5 on 2026-11-24: "only the at-risk tab
clearly gets past" a rule that tells the agent to post comments. Jira's "Summarize work
item" already summarizes a ticket on demand. Nothing that we found tells an agent which
handovers are stale.

## Slice test

| Check                         | Result |
| ----------------------------- | ------ |
| Cuts every layer it needs     | yes — a manifest action and function, the tool over Jira search, the skill file and the guide |
| One e2e test walks it         | yes — through the MCP server: list, read the top ticket, save, list again |
| Worth shipping alone          | yes — a developer asks their agent which handovers in a project are stale, and the agent carries one on |
| Fits (≤5 scenarios, ≤2 areas) | yes — 5 scenarios; the agent's tools, and the skill file with the guide |

**Path:** full — a new MCP tool is a new interface.

## User story

As a developer with a coding agent, I want to ask the agent which tickets of a project
have a missing or stale dogear, so that it picks one up from where the work stopped.

## Flow

```mermaid
flowchart LR
    D((Developer)) -- "which ticket in PAY needs a dogear?" --> A[Coding agent]
    A -- "list-at-risk-dogears PAY" --> T[Dogear tools]
    T -- "search as the person" --> J[(Jira: in-progress tickets and dogears)]
    T -- "PAY-150 No dogear, PAY-142 2 days behind" --> A
    A -- "start on PAY-142?" --> D
    A -- "get-dogear PAY-142, then work, then save-dogear" --> T
```

The developer asks, the agent lists the stale handovers, asks which one to take, reads its
dogear, carries on, and saves. A save takes the ticket off the list.

## Acceptance criteria

```gherkin
Scenario: The agent lists the tickets that need a dogear
  Given project PAY has three in-progress tickets:
    | PAY-150 | Add partial refunds | Hafiz Omar    | no dogear                                    |
    | PAY-142 | Add refund endpoint | Aisyah Rahman | a dogear saved 2 days before its last change |
    | PAY-161 | Refund webhooks     | Mei Ling Tan  | a dogear saved after its last change         |
  When the agent calls list-at-risk-dogears with project PAY
  Then the answer lists PAY-150 with "No dogear" first, then PAY-142 with "Dogear is 2 days behind"
  And each line has the ticket's summary and assignee
  And PAY-161 is not in the answer
  And the answer ends "Checked 3 in-progress tickets in PAY."

Scenario: A save takes the ticket off the list
  Given PAY-142 is on the list with "Dogear is 2 days behind"
  When the agent reads the dogear of PAY-142 and saves a new one
  Then the next list of PAY does not have PAY-142

Scenario: No ticket needs a dogear
  Given each in-progress ticket in PAY has a dogear saved after its last change
  When the agent calls list-at-risk-dogears with project PAY
  Then the answer is "No in-progress ticket in PAY needs a dogear. Checked 3 in-progress tickets in PAY."

Scenario: A project that the person cannot see
  Given the person cannot browse project HR
  When the agent calls list-at-risk-dogears with project HR
  Then the answer is "Jira has no project HR that you can see."

Scenario: Many tickets need a dogear
  Given 14 in-progress tickets in PAY need a dogear
  When the agent calls list-at-risk-dogears with project PAY
  Then the answer lists 10 of them, in the order of the Dogears tab
  And then says "4 more need a dogear. Open the Dogears tab of PAY to see them all."
```

## Scope

**In:**

- The MCP tool `list-at-risk-dogears`, with the same rule and order as the Dogears tab (D17).
  It answers in one plain text and never throws, as the two other tools do.
- A rule in `skills/dogear/SKILL.md` and in the guide's AGENTS.md block: how the agent
  picks a ticket from the list.
- A third prompt in part 3 of `GUIDE.md` that calls the list.

**Out:**

- Assigning the ticket to the person. The built-in Atlassian MCP tools can do it.
- A pick-up brief for a ticket with no dogear, through the agent. The brief stays in the
  panel (D21); the agent reads the ticket itself.
- A list across all projects. The agent names one project.
- The video beat that shows this tool — `submit-entry`.

## Interface

The slice has no screen. Its interface is the tool that the agent calls, the texts that
the tool answers, and the rule in the skill file. The words are the Dogears tab's words.

```mermaid
flowchart LR
    S[Skill rule] -- "when to list, and ask before a pickup" --> A[Coding agent]
    A -- "projectKey: PAY" --> T[list-at-risk-dogears]
    T -- "one plain text: up to 10 lines and a checked line" --> A
    A -- "issueKey of the chosen ticket" --> G[get-dogear]
```

### The tool

| Part | Value |
| ---- | ----- |
| Key and name | `list-at-risk-dogears` · List at-risk dogears |
| Verb | `GET` |
| Description | Lists the in-progress tickets of a Jira project that have no dogear, or a dogear saved more than 1 hour before the ticket last changed. Call it when the person asks which ticket to pick up. Then read the dogear of the ticket that they choose. |
| Input | `projectKey`, a string, required: "The Jira project key, such as PAY." |

### The answers

A list, with one line for each ticket. The order and the label are the Dogears tab's:
tickets with no dogear first, then the largest gap.

```text
Tickets in PAY that need a dogear:
- PAY-150 · Add partial refunds · Hafiz Omar · No dogear
- PAY-142 · Add refund endpoint · Aisyah Rahman · Dogear is 2 days behind
- PAY-175 · Add refund report · Unassigned · Dogear is 5 hours behind, saved outside Dogear
Checked 3 in-progress tickets in PAY.
```

| Case | Text |
| ---- | ---- |
| More than 10 at risk | After the 10th line: "4 more need a dogear. Open the Dogears tab of PAY to see them all." |
| More than 100 in progress | The last line: "Checked the 100 most recently updated of about 240 in-progress tickets in PAY." |
| None at risk | "No in-progress ticket in PAY needs a dogear. Checked 3 in-progress tickets in PAY." |
| None in progress | "No ticket in PAY is in progress. The list checks the tickets whose status is in progress." |
| No such project, or the person cannot see it | "Jira has no project HR that you can see." |
| Access not allowed in the panel | "Open the Dogear panel on a Jira ticket once and select Allow access. Then list again." |
| Jira fails | "Jira did not answer the search. Try again." |

One ticket reads "1 in-progress ticket", as on the tab.

### The skill rule

A sixth rule in `skills/dogear/SKILL.md` and in the guide's AGENTS.md block:

> When I ask which ticket to pick up, list the tickets of the project that need a dogear.
> Show me the list, and ask which one to start before you read its dogear.

### The guide

Part 3 of `GUIDE.md` gets one step and a third prompt. The judge makes a second ticket,
"Refund webhooks retry forever", and moves it to In Progress. Then: "Which tickets in KAN
need a dogear?" Claude Code lists that ticket with "No dogear" and asks which one to start.

## Technical plan

### Approach

A third tool function sits beside `getDogear` and `saveDogear`. It checks the project key,
then calls the same search as the Dogears tab. That search moves out of `getAtRisk` into one
exported function, so the tab and the tool cannot drift apart. A pure helper turns the rows
into the text. The search runs as the person (D13), so Jira leaves out each ticket that they
cannot view.

```mermaid
flowchart LR
    A[Coding agent] -- "projectKey" --> M[Atlassian MCP server]
    M -- "inputs, caller" --> L["listAtRiskDogears (src/tools)"]
    L -- "GET project as the person" --> J[(Jira REST API)]
    L -- "findAtRisk(projectKey)" --> R["findAtRisk (src/resolvers)"]
    P["getAtRisk, the Dogears tab"] -- "findAtRisk(projectKey)" --> R
    R -- "search with properties (D18)" --> J
    R -- "riskRows (D17)" --> H["Helpers (src/lib)"]
    L -- "atRiskText" --> H
```

```mermaid
sequenceDiagram
    participant A as Coding agent
    participant T as listAtRiskDogears
    participant J as Jira
    A->>T: projectKey "pay"
    T->>T: upper case, check the key shape
    T->>J: GET /rest/api/3/project/PAY (as the person)
    J-->>T: 200, or 404 when it does not exist or cannot be seen
    T->>J: POST /rest/api/3/search/jql (findAtRisk)
    J-->>T: up to 100 in-progress tickets with their dogears
    T->>T: riskRows, then atRiskText
    T-->>A: "Tickets in PAY that need a dogear: ..."
```

The project key comes from the agent, so it is untrusted input. It reaches the JQL only
after it matches the shape of a Jira key, `^[A-Z][A-Z0-9_]+$`. A key of another shape
gets the "no project" answer with no Jira call.

Relies on: D1, D12, D13, D14, D17, D18, D39, D40

### Changes

| File | Change | Why |
| ---- | ------ | --- |
| `src/resolvers/index.js:99` | Move the body of `getAtRisk` into an exported `findAtRisk(projectKey)` that returns `{ rows, checked, inProgress }`. `getAtRisk` calls it with the project of the context and keeps its log line and its answer. | The tool and the tab share one search and one rule. `src/tools/index.js:5` already imports `displayName` from here. |
| `src/lib/summary.js` | Add `atRiskText(projectKey, { rows, checked, inProgress })`, which gives each text of "The answers". It reuses `behindLabel` (`src/lib/age.js:21`) and the tab's words. | A pure function, tested without Jira. |
| `src/tools/index.js` | Add `listAtRiskDogears(payload)`: the key check, the project read, `findAtRisk`, `atRiskText`. It catches `NeedsAuthenticationError` with `allowAccess('list')` (`src/tools/index.js:16`), and each other error with "Jira did not answer the search. Try again." It logs `at-risk list via=agent project=PAY checked=3 atRisk=2`. | Scenarios 1, 3, 4, 5. |
| `manifest.yml:23` | Add `list-at-risk-dogears` to the tools of `stand-note-mcp`, an action with the description and the input of "The tool", and a function `list-at-risk-dogears-fn` with the handler `index.listAtRiskDogears`. | The MCP server lists the tool. |
| `src/index.js` | Export `listAtRiskDogears`, as it exports the two other tools. | The handler of the function. |
| `skills/dogear/SKILL.md`, `GUIDE.md` | The sixth rule, in both. "Two MCP tools" becomes three, with the new name. Part 3 gets the second ticket and the third prompt. | The skill rule and the guide of "Interface". |
| `README.md` | "two MCP tools" becomes three, with the new name. | It names the tools. |
| `test/summary.test.js`, `test/tools.test.js`, `test/brand.test.js` | Tests of each text, of the tool against the fake Jira, and of the sixth rule. `rules(skill).length` becomes 6. | Scenarios 1, 3, 4, 5. |
| `test/resolvers.test.js` | The `getAtRisk` tests stay as they are and pass. | They prove the move kept the tab's answer. |
| `e2e/at-risk-list.spec.js` | A test that calls the tool through the MCP server on the SNR tickets of `beforeEach`, saves the dogear of the ticket that is behind, and calls the tool again. A test with the key `ZZQ`. | Scenarios 1, 2 and 4 on the real site. SNR is the project of this file (D20). |

### Earn-it

- `findAtRisk` — scenario 1 needs the tab's search and rule in the tool. A copy would let
  the two drift apart.
- `atRiskText` — scenarios 1, 3 and 5 have seven texts. A pure helper tests them without a
  fake Jira.
- The project read — scenario 4. A search on an unknown project gives a Jira error, not
  "no project".

No new dependency, scope, config or storage.

### Non-functionals

- **Load:** one call for each time a developer asks for a pickup: some tens a day on a
  judge's site. Each call makes two or three Jira requests.
- **What breaks first at 10 times:** nothing. Jira's rate limit is far away, and the search
  reads at most 100 tickets.
- **Security:** any person whose agent has the Dogear server can call the tool. It reads as
  that person (D13), so it lists only tickets that they can view. The project key is the
  only input, and it reaches the JQL only in the shape of a Jira key. The answer has no
  note texts (D40). It touches no secret except the signing key, through `riskRows`.
- **Proof it works**: `bash scripts/forge.sh logs -e production` shows
  `at-risk list via=agent project=` from a judge's site.
- **Rollout**: no flag. The tool is new, so nothing that works today changes. To roll back:
  revert the merge and run `npm run deploy:prod`; the MCP server then lists two tools again.

### Test plan

| Scenario | Proof | Command |
| -------- | ----- | ------- |
| 1, the list | `atRiskText` with three rows; `listAtRiskDogears` with a fake search; the e2e test on SNR | `npm test`, then `npm run e2e` |
| 2, a save takes it off | The e2e test: save through `save-dogear`, list again | `npm run e2e` |
| 3, none at risk | `atRiskText` with no rows; and with none in progress | `npm test` |
| 4, no project | The tool with a 404 project read, and with the key `pay-142!`; the e2e test with `ZZQ` | `npm test`, then `npm run e2e` |
| 5, many | `atRiskText` with 14 rows, and with 100 checked of about 240 | `npm test` |

The e2e test that walks the slice is the new test in `e2e/at-risk-list.spec.js`. Before it
runs: `npm run deploy`. The build found that the sign-in from before the deploy already
calls the new tool, so no new `npm run e2e:mcp-login` is needed.

### Chunks

Single chunk.

### Risks

| Risk | Mitigation |
| ---- | ---------- |
| An MCP sign-in from before the deploy does not list the third tool. | The build disproved it on development on 2026-11-24: the old sign-in called `list-at-risk-dogears`. A judge signs in after the install in any case. |
| The agent starts on a ticket with no word to the person. | The skill rule says to ask (D39). Claude Code also asks before each tool call that it has no permission for. |
| A judge's ticket list is long, and the answer fills the agent's context. | 10 lines at most (O2). |

### Decisions to record

Recorded as D39, D40.

## Open items

| ID | What | Type | Raised at | Owner | Status | Answer |
| -- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1 | What does the agent give the tool: a project key that it takes from the branch (PAY from `feat/pay-142-refund`), or nothing, with the tool guessing a project? | question | spec p1 | user | Resolved | A project key, required. The agent takes PAY from the branch `feat/pay-142-refund`, or asks the person. 2026-11-24 |
| O2 | How many tickets does one answer list? Each line costs the agent's context. The Dogears tab checks up to 100 tickets. | question | spec p1 | user | Resolved | 10 tickets, in the order of the Dogears tab, then a count of the rest that sends the person to the tab. 2026-11-24 |
| O3 | When the agent picks a ticket from the list, does it start on its own, or ask first? A listed ticket often has another person as its assignee. | question | spec p1 | user | Resolved | Ask first. The skill tells the agent to show the list and ask before it starts on a ticket. Drafted as an entry at pause 3. 2026-11-24 |
| O4 | Does the list carry each ticket's Next, or only the key, summary, assignee and how far behind? The Dogears tab keeps the note texts on the server (at-risk-list). | question | spec p1 | user | Resolved | No texts. Each line has the key, summary, assignee and how far behind, as on the Dogears tab. The agent calls `get-dogear` on the ticket it picks. Drafted as an entry at pause 3. 2026-11-24 |
| O5 | After part 2 of the guide, the judge's only ticket, KAN-1, has a current dogear, so the third prompt would answer "No in-progress ticket in KAN needs a dogear". How does the guide give the list a ticket to show? | question | spec p2 | user | Resolved | A second ticket in part 3. The judge makes "Refund webhooks retry forever" and moves it to In Progress. The list shows it with "No dogear", and the agent asks, reads and saves. 2026-11-24 |

## Glossary

- **MCP tool** — a function that a coding agent calls through the Atlassian MCP server.
- **At risk** — an in-progress ticket with no dogear, or a dogear saved more than 1 hour
  before the ticket last changed (D17).
- **Dogears tab** — the project page of Dogear that lists the tickets at risk.
- **e2e** — end to end. An e2e test uses the app as a user does.
