# Agent pickup

**Version:** v1 · **Status:** Draft · **Type:** Feature · **Project type:** Web UI

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

## Open items

| ID | What | Type | Raised at | Owner | Status | Answer |
| -- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1 | What does the agent give the tool: a project key that it takes from the branch (PAY from `feat/pay-142-refund`), or nothing, with the tool guessing a project? | question | spec p1 | user | Open | — |
| O2 | How many tickets does one answer list? Each line costs the agent's context. The Dogears tab checks up to 100 tickets. | question | spec p1 | user | Open | — |
| O3 | When the agent picks a ticket from the list, does it start on its own, or ask first? A listed ticket often has another person as its assignee. | question | spec p1 | user | Open | — |
| O4 | Does the list carry each ticket's Next, or only the key, summary, assignee and how far behind? The Dogears tab keeps the note texts on the server (at-risk-list). | question | spec p1 | user | Open | — |

## Glossary

- **MCP tool** — a function that a coding agent calls through the Atlassian MCP server.
- **At risk** — an in-progress ticket with no dogear, or a dogear saved more than 1 hour
  before the ticket last changed (D17).
- **Dogears tab** — the project page of Dogear that lists the tickets at risk.
- **e2e** — end to end. An e2e test uses the app as a user does.
