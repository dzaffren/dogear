# CodegeistHackathon · architecture

**Status:** Active · **Updated:** 2026-11-21 by /ship stand-note

## Context

```mermaid
flowchart LR
    U((Person on a ticket)) -- "reads and saves the note" --> J[Jira ticket view]
    J -- "renders the panel" --> A[Stand Note Forge app]
    A -- "REST calls as the user" --> P[(Jira issue property stand-note)]
```

## Components

```mermaid
flowchart LR
    F["Panel (src/frontend)"] -- "invoke getNote / saveNote, four texts" --> R["Resolver (src/resolvers)"]
    R -- "note, canEdit, server time" --> F
    R -- "cleanNote, ageLabel" --> L["Helpers (src/lib)"]
    F -- "ageLabel, MAX_LENGTH" --> L
    R -- "GET and PUT as the user" --> J[(Jira REST API)]
```

| Component | Folder           | What it does |
| --------- | ---------------- | ------------ |
| Panel     | `src/frontend/`  | The UI Kit panel on the ticket: the read view, the form and the two errors. |
| Resolver  | `src/resolvers/` | Reads and saves the note as the user, checks the edit permission, stamps the author and the time. |
| Helpers   | `src/lib/`       | `cleanNote` trims and caps the four texts; `ageLabel` gives the age of a note. |
