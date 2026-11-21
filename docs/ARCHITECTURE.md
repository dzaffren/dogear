# CodegeistHackathon · architecture

**Status:** Active · **Updated:** 2026-11-21 by /ship agent-checkpoint

## Context

```mermaid
flowchart LR
    U((Person on a ticket)) -- "reads and saves the note" --> J[Jira ticket view]
    J -- "renders the panel" --> A[Stand Note Forge app]
    L((Lead of a project)) -- "opens Stand notes" --> PP[Jira project view]
    PP -- "renders the at-risk list" --> A
    G((Coding agent)) -- "MCP tool calls" --> M[Atlassian MCP server]
    M -- "inputs, caller's account ID" --> A
    A -- "REST calls as the user" --> P[(Jira issue property stand-note)]
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
    T -- "cleanNote, tooLong, savedLine, sign" --> L
    R -- "sign, riskRows" --> L
    PG["Stand notes page (src/frontend/at-risk.jsx)"] -- "invoke getAtRisk" --> R
    R -- "at-risk rows, counts, server time" --> PG
    PG -- "ageLabel, behindLabel" --> L
```

| Component | Folder           | What it does |
| --------- | ---------------- | ------------ |
| Panel     | `src/frontend/`  | The UI Kit panel on the ticket: the read view, the form and the two errors. |
| Page      | `src/frontend/at-risk.jsx` | The UI Kit project page Stand notes: the in-progress tickets with no note or a note that is behind. |
| Resolver  | `src/resolvers/` | Reads and saves the note as the user, checks the edit permission, stamps the author and the time. `getAtRisk` searches the in-progress tickets of the project with their notes. |
| Tools     | `src/tools/`     | The two MCP tools of the agent, `get-stand-note` and `save-stand-note`. Each answers in one plain text and never throws. |
| Helpers   | `src/lib/`       | `cleanNote` trims and caps the four texts; `tooLong` names a field over the limit; `ageLabel` and `savedLine` give the age and the saved line; `sign` and `isSigned` sign a note with the Forge variable `NOTE_SIGNING_KEY` (server only); `riskRows` picks and orders the tickets at risk, and `behindLabel` says how far a note is behind. |
