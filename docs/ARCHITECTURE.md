# Dogear · architecture

**Status:** Active · **Updated:** 2026-11-24 by /ship agent-pickup

## Context

```mermaid
flowchart LR
    U((Person on a ticket)) -- "reads and saves the dogear" --> J[Jira ticket view]
    J -- "renders the panel" --> A[Dogear Forge app]
    L((Lead of a project)) -- "opens Dogears" --> PP[Jira project view]
    PP -- "renders the at-risk list" --> A
    G((Coding agent)) -- "MCP tool calls" --> M[Atlassian MCP server]
    M -- "inputs, caller's account ID" --> A
    A -- "REST calls as the user" --> P[(Jira issue property stand-note)]
    A -- "ticket text for a pick-up brief" --> LLM[Forge LLM: Claude Haiku]
```

## Components

```mermaid
flowchart LR
    F["Panel (src/frontend)"] -- "invoke getNote / saveNote, four texts" --> R["Resolver (src/resolvers)"]
    R -- "note, canEdit, server time" --> F
    R -- "cleanNote, ageLabel" --> L["Helpers (src/lib)"]
    F -- "savedLine, MAX_LENGTH" --> L
    R -- "GET and PUT as the user" --> J[(Jira REST API)]
    T["Tools (src/tools)"] -- "GET and PUT as the user" --> J
    T -- "cleanNote, tooLong, savedLine, sign, atRiskText" --> L
    T -- "findAtRisk, displayName" --> R
    R -- "sign, riskRows" --> L
    PG["Dogears page (src/frontend/at-risk.jsx)"] -- "invoke getAtRisk" --> R
    R -- "at-risk rows, counts, server time" --> PG
    PG -- "ageLabel, behindLabel" --> L
    F -- "invoke getBrief" --> R
    R -- "ticketText, parseBrief, sourceLine" --> L
    R -- "rules and ticket text" --> LLM[Forge LLM]
    R -- "count of briefs for the day" --> K[(Key-value store)]
```

| Component | Folder           | What it does |
| --------- | ---------------- | ------------ |
| Panel     | `src/frontend/`  | The UI Kit panel on the ticket: the read view, the form and the two errors. On a ticket with no dogear, the button and the view of the pick-up brief (`BriefView.jsx`). |
| Page      | `src/frontend/at-risk.jsx` | The UI Kit project page Dogears: the in-progress tickets with no dogear or a dogear that is behind. |
| Resolver  | `src/resolvers/` | Reads and saves the dogear as the user, checks the edit permission, stamps the author and the time. `findAtRisk` searches the in-progress tickets of a project with their notes, for `getAtRisk` and the agent's list. `getBrief` reads a ticket through REST v2, asks Forge LLM for the pick-up brief, and counts the briefs of the site for each UTC day, 50 at most. |
| Icon      | `static/icons/`  | `dogear.svg`, the bundled icon of the panel and the Dogears tab (D38). |
| Tools     | `src/tools/`     | The three MCP tools of the agent, `get-dogear`, `save-dogear` and `list-at-risk-dogears`. Each answers in one plain text and never throws. |
| Helpers   | `src/lib/`       | `cleanNote` trims and caps the four texts; `tooLong` names a field over the limit; `ageLabel` and `savedLine` give the age and the saved line; `sign` and `isSigned` sign a note with the Forge variable `NOTE_SIGNING_KEY` (server only); `riskRows` picks and orders the tickets at risk, and `behindLabel` says how far a note is behind; `ticketText`, `parseBrief` and `sourceLine` (`brief.js`) give the model's input, check its answer and count the sources of a brief. |
