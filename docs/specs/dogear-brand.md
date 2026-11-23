# Dogear brand

**Version:** v1 · **Status:** Refined · **Type:** Enhancement · **Project type:** Web UI

**Shape doc:** docs/specs/ticket-handover/shape.md
**Depends on:** stand-note, agent-checkpoint, at-risk-list, pick-up-brief

The app and its note get one name, Dogear, with a logo and one brand kit for the guide, the
Devpost entry and the video. It ships now because the production deploy, the guide and the
video of `judge-ready-entry` carry the name and the logo.

## Problem

The app has a working name, Stand Note, and Forge's default icon. A judge meets the app in
five places: the install screen, the ticket, the list of MCP servers in a coding agent, the
Devpost entry and the video. Nothing ties the five together.

The app also has two words for one thing. The app is "Stand Note", and the note is a
"stand note". A new name for the app alone makes a third word.

The judges score design at 20%: "a complete, coherent product experience — not just a
technical proof of concept". The rules also say that the app must work as the video shows
it. The name in the video must be the name on the install screen.

A dog-ear is the folded corner of a page. It marks where a reader stopped. The app is
Dogear, and the note on a ticket is a dogear.

## Slice test

| Check                         | Result |
| ----------------------------- | ------ |
| Cuts every layer it needs     | yes — the app's name in Atlassian's developer console, the manifest, each text and tool name that says "stand note", the icon files, and the brand kit |
| One e2e test walks it         | yes — an agent saves with `save-dogear`, the panel named Dogear shows the dogear, and the Dogears tab lists the ticket. The list of apps is one hand check |
| Worth shipping alone          | yes — a person who installs the app sees one word and one mark in each place |
| Fits (≤5 scenarios, ≤2 areas) | yes — 4 scenarios, two areas: the app in Jira, and the brand kit |

**Path:** full — a new name in each text and tool, a new logo, and new files that other work uses.

## User story

As a Codegeist judge, I want one word and one mark on the install screen, the ticket, the
agent's tools and the video, so that I know that they are one product.

## Flow

```mermaid
flowchart LR
    J((Priya, a site admin)) -- "opens the install screen" --> I["Install screen: Dogear"]
    I -- "installs, then opens a ticket" --> P["Panel: Dogear"]
    P -- "opens the tabs of the project" --> T["Tab: Dogears"]
    J -- "adds the MCP server as dogear in a coding agent" --> C["Tools: get-dogear and save-dogear"]
    D((Dzafran)) -- "takes the logo, the colours and the typeface" --> K["Brand kit in docs/design/logo/kit"]
    K -- "used by judge-ready-entry" --> G["Guide, Devpost entry, video"]
```

Priya sees the word Dogear at the install, on the ticket, on the project tab and in the
agent's tools. Dzafran builds the guide, the Devpost entry and the video from one kit.

## Acceptance criteria

```gherkin
Scenario: The site shows the app as Dogear
  Given the app is deployed to the development environment of dzaffren.atlassian.net
  When Dzafran opens the list of apps of the site in Atlassian Administration
  Then the list shows the app as "Dogear", with the Dogear icon
  And the list shows no app named "Stand Note"

Scenario: The ticket and the project say Dogear
  Given ticket PAY-142 got a note on 2026-11-21, before the rename
  When Aisyah Rahman opens PAY-142
  Then the panel header shows the title "Dogear"
  And the panel shows the note from 2026-11-21, with its four texts
  When Aisyah opens a ticket with no note
  Then the panel says "No dogear yet"
  And the tab of project PAY has the title "Dogears"
  And no text of the panel or of the tab says "stand note"

Scenario: A coding agent sees Dogear
  Given the README tells a person to add the MCP server under the name "dogear"
  And a coding agent is connected to the MCP server of the app
  When Dzafran lists the tools of the server in the agent
  Then the tools are "get-dogear" and "save-dogear", each with the ending "_development" in the development environment
  And no tool has "stand-note" in its name
  When the agent reads PAY-142 with "get-dogear"
  Then the answer starts with "Dogear on PAY-142"
  When the agent reads a ticket with a note that a script wrote through Jira's API
  Then the answer says "Saved outside Dogear"

Scenario: The brand kit has what the entry needs
  Given the kit is in docs/design/logo/kit
  When Dzafran opens the guidelines of the kit
  Then the kit has the symbol, the wordmark and the lockup of both, as SVG and as PNG
  And it has the app icon, for a light and for a dark background
  And it has the thumbnail image for the Devpost entry
  And the guidelines give the colours, the typeface and the tagline "Mark where you stopped."
  And the guidelines say how the name stands beside "Jira", by Atlassian's trademark rules
```

## Scope

**In:**

- The word Dogear in each place that a person or an agent sees: the app's name in
  Atlassian's developer console, the panel, the project tab, the pick-up brief, the name of
  the MCP server, the two tools and their answers, and the rule text for agents.
- The note is a "dogear". The panel's title is "Dogear", the tab's title is "Dogears", and
  the tools are `get-dogear` and `save-dogear`. Pause 2 lists each text, old and new.
- The README, the overview and the architecture doc say Dogear.
- The repo on GitHub gets the name `dogear`. Dzafran renames it, or approves the rename at
  the build.
- A logo for Dogear: a design brief, two rounds of concepts, and the chosen mark, Page pup.
- The app's avatar on Atlassian's screens, from the kit. Dzafran uploads it in the Settings
  of the app in the developer console.
- A brand kit: the logo files, the icon files, the colours, the typeface, the tagline, the
  thumbnail for Devpost, and short guidelines.

**Out:**

- The icon on the panel and on the Dogears tab. It is a PNG at a public web address, and
  the address works only when the repo is public — `judge-ready-entry` adds it to the
  manifest and checks it at 16 pixels in both themes (O6).
- The stored property of a note. It keeps the key `stand-note`, so each note from before
  the rename still shows. Nobody sees the key — not planned.
- The shipped specs, the decisions and the changelog. They keep their old text, as a
  record — not planned.
- A new look inside the panel and the tab. Forge UI Kit gives the app no control of colours
  or type (D3) — not planned.
- The guide, the Devpost entry, the video and the production deploy — `judge-ready-entry`.
- Images for a Marketplace listing — not planned. D1 aims for one bonus prize.
- The registration of Dogear as a trademark — not planned.

## Interface

**Design system:** Forge UI Kit, as in `stand-note` (D3). The panel and the tab get new
words and one icon, and no new component. The brand kit is new material for use outside
Jira. This slice adds it on purpose.

**Motion tier:** 0. UI Kit gives the app no control of motion, and a logo file does not move.

**Reference:** Linear, for restraint with colour: one mark, one accent. From Hound's mark: a
dog can be one flat shape. Here the dog's ear is also the fold of the page.

**Preview:** `docs/design/logo/kit/board/logo.png` shows the logo, and
`docs/design/logo/kit/board/in-use.png` shows it in use. UI Kit renders only inside Jira, so
the build shows the new words on `dzaffren.atlassian.net`.

```mermaid
flowchart LR
    K["Kit: symbol, icon, lockup"] -- "app avatar" --> A["Developer console: app named Dogear"]
    A -- "name and avatar" --> I["Install, consent and app-list screens"]
    M["Manifest: titles and tool names"] -- "Dogear" --> P["Panel header: Dogear"]
    M -- "Dogears" --> T["Project tab: Dogears"]
    M -- "get-dogear, save-dogear" --> C["Agent: the server added as dogear"]
    K -- "lockup, colours, typeface" --> O["Outside Jira: README, Devpost thumbnail, video title card"]
```

The kit gives the app its avatar. The manifest gives the panel and the tab their titles, and
gives the agent the two tool names. The icon of the panel and of the tab comes in
`judge-ready-entry`, when the repo is public. The README, the Devpost entry and the video take the lockup,
the colours and the typeface.

### The word

The app is "Dogear". The note is a "dogear", with a small d inside a sentence. The plural
is "dogears". No text says "stand note", and no text says "note" alone for the dogear.

### Each text, old and new

| Where | Old | New |
| ----- | --- | --- |
| App name, in Atlassian's screens | Stand Note | Dogear |
| Panel title | Stand note | Dogear |
| Panel label | Where the work stands | Where the work stands |
| Panel, while it loads | Loading the stand note | Loading the dogear |
| Panel, empty | No stand note yet | No dogear yet |
| Panel, empty, second line | Say where the work stands, so a teammate can carry on. | Mark where you stopped, so a teammate can carry on. |
| Panel, load error | The note did not load. Reload the page. | The dogear did not load. Reload the page. |
| Form, save error | The note was not saved. Try again. | The dogear was not saved. Try again. |
| Saved line, unsigned note | Saved outside Stand Note, 2 days ago | Saved outside Dogear, 2 days ago |
| Brief, warning | Not a stand note. Check it before you rely on it. | Not a dogear. Check it before you rely on it. |
| Brief, button | Use as stand note | Use as dogear |
| Tab title | Stand notes | Dogears |
| Tab, column head | Stand note | Dogear |
| Tab, tag | No note | No dogear |
| Tab, tag | Note is 2 days behind | Dogear is 2 days behind |
| Tab, small text | saved outside Stand Note | saved outside Dogear |
| Tab, rule | A ticket is at risk when it has no stand note, or when it changed more than 1 hour after its note was saved. | A ticket is at risk when it has no dogear, or when it changed more than 1 hour after its dogear was saved. |
| Tab, all current | Each of the 12 in-progress tickets has a current stand note. | Each of the 12 in-progress tickets has a current dogear. |
| MCP server name, in the manifest | Stand Note | Dogear. An agent does not see it: Atlassian's server reports `integrations-service` (O8) |
| Tool names | `get-stand-note`, `save-stand-note` | `get-dogear`, `save-dogear` |
| Tool titles | Get stand note, Save stand note | Get dogear, Save dogear |
| Read tool, first line | Stand note on PAY-142 | Dogear on PAY-142 |
| Read tool, no note | PAY-142 has no stand note. | PAY-142 has no dogear. |
| Save tool, done | Saved the stand note on PAY-142. | Saved the dogear on PAY-142. |
| Save tool, empty | A stand note needs text in Done, Next, Watch out or Code. | A dogear needs text in Done, Next, Watch out or Code. |
| Save tool, no permission | You cannot edit PAY-142, so the note was not saved. | You cannot edit PAY-142, so the dogear was not saved. |
| Save tool, Jira fails | Jira did not answer the save. The note was not saved. Try again. | Jira did not answer the save. The dogear was not saved. Try again. |
| Tools, no consent | Open the Stand note panel on a Jira ticket once and select Allow access. | Open the Dogear panel on a Jira ticket once and select Allow access. |

These texts stay: "Build a brief from Jira", "Brief from Jira", "Saved by Aisyah Rahman, 2
days ago", the four field names, and each text of the at-risk count.

### What an agent reads

An agent does not know the word. The description of each tool says what a dogear is.

- `get-dogear`: "Reads the dogear of a Jira ticket. A dogear is a short note that says what
  is done, what is next, what to watch out for, and where the code is. Call it when work on
  a ticket starts, and before each save."
- `save-dogear`: "Saves the dogear of a Jira ticket, so that a teammate or their agent can
  carry on. A dogear is a short note: Done, Next, Watch out, Code. The save replaces the
  whole dogear: send each field that is still true. Call it after each step, and before
  you stop."

The rule text for agents in the README gets the heading "Dogear", the server name `dogear`,
and the same first line: "Each Jira ticket has a dogear: a short note with Done, Next, Watch
out, Code."

### The logo

The brief is in `docs/design/logo/brief.md`. It records two rounds of concepts.

| Round | Concepts | Result |
| ----- | -------- | ------ |
| 1 | Fold-ear, Folded D, Corner. `docs/design/logo/concepts.png` | None chosen. Dzafran asked for a warmer round. |
| 2 | Page pup, Origami pup, Folded d. `docs/design/logo/round-2/concepts.png` | Page pup chosen. |

**Page pup:** a page with a face. Its folded corner is the ear. The dog-ear of the page is
the dog's ear.

The kit is in `docs/design/logo/kit`, from commit `38d4f32`. Its guidelines are in
`docs/design/logo/kit/guidelines.md`. The build makes no logo. It uses these files:

| Use | File in `docs/design/logo/kit` |
| --- | ------------------------------ |
| Panel and tab icon, in `judge-ready-entry` | a PNG of `svg/dogear-symbol-small.svg`, at a public web address |
| App avatar in Atlassian's screens | `png/dogear-app-icon-light-512.png` |
| README header | `png/dogear-logo-horizontal-1200.png` |
| Devpost thumbnail | `png/devpost-thumbnail.png` |
| Video title card | `svg/dogear-logo-horizontal.svg`, `svg/dogear-logo-horizontal-on-dark.svg` |

| Colour | HEX | Use |
| ------ | --- | --- |
| Ginger | `#E55F12` | The symbol. One accent. |
| Ink | `#231A14` | The name, text, dark backgrounds |
| Paper | `#FFF6EA` | Light backgrounds |

Ginger has a contrast of 3.5 to 1 on white and 4.6 to 1 on Jira's dark grey `#1D2125`. That
is enough for the symbol, and not for small text. The name in the logo is drawn shapes.
Other text uses Montserrat.

## Technical plan

### Approach

The slice is a rename in place. Each text and each tool name that a person or an agent sees
changes from "stand note" to "dogear". The stored property keeps the key `stand-note`, and
the code keeps the word "note" in its file names and its helpers, because a dogear is a
note. The app's name and avatar change by hand in Atlassian's developer console. The kit is
already in the repo, so the build draws nothing.

Relies on: D3, D4, D12, D14, D15, D19, D29, D30, D31

```mermaid
flowchart TB
    subgraph repo
        MF["manifest.yml: titles, server name, tool keys"]
        SRC["src: panel, form, brief, tab, tool answers"]
        DOC["README, OVERVIEW, ARCHITECTURE"]
        KIT["docs/design/logo/kit"]
    end
    subgraph Atlassian
        CON["Developer console: app name, avatar"]
        JIRA["Jira: panel Dogear, tab Dogears"]
        MCP["MCP server: get-dogear, save-dogear"]
    end
    MF -- "forge deploy" --> JIRA
    MF -- "forge deploy" --> MCP
    SRC -- "forge deploy" --> JIRA
    SRC -- "forge deploy" --> MCP
    KIT -- "avatar PNG, by hand" --> CON
    KIT -- "logo PNG" --> DOC
    CON -- "name Dogear" --> JIRA
```

The manifest and the source go to Jira and to the MCP server in one deploy. The name and the
avatar go to the developer console by hand.

```mermaid
sequenceDiagram
    participant G as Coding agent
    participant M as Atlassian MCP server
    participant T as getDogear in src/tools
    participant J as Jira REST API
    G->>M: tools/call get-dogear_development, issueKey PAY-142
    M->>T: payload, the caller's account
    T->>J: GET issue PAY-142 with the property stand-note
    J-->>T: the stored note
    T-->>M: "Dogear on PAY-142", the saved line, the four fields
    M-->>G: one plain text
```

The agent calls the tool by its new name. The tool reads the same property as before, and
answers with the new word.

### Changes

| File | What changes | Why |
| ---- | ------------ | --- |
| `manifest.yml:8`, `:16` | Panel title "Dogear", tab title "Dogears". The keys `stand-note-panel` and `stand-notes-page` stay, so Jira keeps the same modules. | Scenario 2 |
| `manifest.yml:22-26` | Server name "Dogear", tools `get-dogear` and `save-dogear`. | Scenario 3 |
| `manifest.yml:28-51` | The two actions: keys, names "Get dogear" and "Save dogear", and the descriptions from the Interface section. | Scenario 3 |
| `manifest.yml:78-81` | Function keys `get-dogear-fn` and `save-dogear-fn`, handlers `index.getDogear` and `index.saveDogear`. | They sit beside the tool keys |
| `src/index.js:2` | Exports `getDogear` and `saveDogear`. | The handlers above |
| `src/tools/index.js:7`, `:16`, `:19`, `:30-35`, `:41`, `:48`, `:57`, `:65`, `:75-79` | The two function names, each answer text, and the log lines. | Scenario 3 |
| `src/lib/age.js:21`, `:29` | "Dogear is 2 days behind", "Saved outside Dogear". | Scenarios 2 and 3 |
| `src/lib/summary.js:5-8` | "has a current dogear". | Scenario 2 |
| `src/frontend/index.jsx:45`, `:49`, `:74` | The load error, the spinner label, "No dogear yet". | Scenario 2 |
| `src/frontend/NoteForm.jsx:32-34`, `:50-51`, `:59-61`, `:71` | "No dogear yet", "Mark where you stopped, so a teammate can carry on.", the save error, and the field ids. | Scenario 2 |
| `src/frontend/BriefView.jsx:12`, `:41`, `:61` | "Not a dogear. Check it before you rely on it.", "Use as dogear". | Scenario 2 |
| `src/frontend/at-risk.jsx:22`, `:32`, `:39`, `:107` | The column head, the tag "No dogear", "saved outside Dogear", the rule text. | Scenario 2 |
| `src/resolvers/index.js:21`, `:68`, `:81`, `:138` | The error text, the log line, two comments. | Scenario 2 |
| `src/lib/note.js:1`, `src/lib/signature.js:4-5` | Comments. `PROPERTY_KEY` stays `'stand-note'`. | Each note from before the rename still shows |
| `package.json:2`, `package-lock.json` | The package name `dogear`. | The repo becomes public |
| `test/tools.test.js`, `test/age.test.js`, `test/summary.test.js`, `test/risk.test.js`, `test/resolvers.test.js` | The expected texts and the two function names. | The texts above |
| `test/note.test.js` | One new check: `PROPERTY_KEY` is `'stand-note'`. | Scenario 2: a note from before the rename still shows |
| `test/brand.test.js` (new) | Three checks: no file in `src/` and no line of `manifest.yml` says "stand note", other than the property key; the README adds the server as `dogear`; each file that the kit's guidelines name is there. | Scenarios 2, 3 and 4 |
| `e2e/panel.js:4`, `:10` | "No dogear yet", and a header match that takes "Dogear" and not "Dogears". | Scenario 2 |
| `e2e/stand-note.spec.js:48`, `e2e/pick-up-brief.spec.js`, `e2e/at-risk-list.spec.js:35`, `:91`, `:115` | The new texts. | Scenario 2 |
| `e2e/agent-checkpoint.spec.js`, `e2e/mcp.js:34`, `:55` | The tool names, the answer texts, the client names. | Scenario 3 |
| `README.md` | Each section says Dogear. The logo is at the top. The server goes in as `dogear`, and the rule text for agents has the heading "Dogear". | Scenario 3 |
| `OVERVIEW.md`, `docs/ARCHITECTURE.md` | Each text and each diagram label says Dogear and dogear. The slice names stay. | The repo becomes public |

Reusing: `savedLine` and `behindLabel` in `src/lib/age.js`, `currentLine` in
`src/lib/summary.js`, `openPanel` in `e2e/panel.js`, `callTool` in `e2e/mcp.js`. Each keeps
its name and its job.

These stay as they are: the name of the permission scheme in `e2e/setup-site.mjs:10`, which
is on the site already; `e2e/.auth/mcp.json`; the shipped specs, `DECISIONS.md`,
`CHANGELOG.md` and `docs/learnings/`.

**Hand steps, by Dzafran.** The build does not do them, because each one changes something
outside the repo:

1. In the developer console, open the app, then Settings. Change the name to "Dogear", and
   upload `docs/design/logo/kit/png/dogear-app-icon-light-512.png` as the avatar.
2. Rename the GitHub repo to `dogear`: `gh repo rename dogear`. Then run
   `git remote set-url origin https://github.com/dzaffren/dogear.git`.
3. After the deploy, open Connected apps in Atlassian Administration. Check that "Expose
   tools to MCP-compatible apps" is still on for Dogear.
4. Change the rule text in the `CLAUDE.md` of each repo where an agent uses the old tool
   names.

### Earn-it

| Added | Triggered by |
| ----- | ------------ |
| `test/brand.test.js` | Scenario 2, "no text says stand note". No other test sees a text that the rename missed. |

The slice adds no layer, no option and no dependency.

### Non-functionals

|                      |                                                                               |
| -------------------- | ----------------------------------------------------------------------------- |
| **Load**             | As before. The rename adds no call. |
| **Breaks first**     | Nothing new at 10 times the load. An agent that still calls `get-stand-note` gets "tool not found" from the MCP server. |
| **Security surface** | As before: the same scopes, the same callers, the same stored note. The signature of a note does not use the name of the app, so each signed note stays signed. |
| **Proof it works**   | `bash scripts/forge.sh logs -e development` shows `dogear saved issue=PAY-142 via=agent` after a save from an agent. |
| **Rollout**          | No flag. `npm run deploy` puts it in the development environment. To roll back, run `git revert` on the rename commits and deploy again. The stored notes need no change in either direction. |

### Test plan

| Scenario | Test | Command |
| -------- | ---- | ------- |
| 1, the site shows Dogear | Hand check: the list of apps in Atlassian Administration, after hand step 1 | — |
| 2, the ticket and the project say Dogear | `e2e/stand-note.spec.js`, `e2e/pick-up-brief.spec.js`, `e2e/at-risk-list.spec.js`, `test/brand.test.js` | `npm test`, then `npm run deploy` and `npm run e2e` |
| 2, a note from before the rename still shows | `test/note.test.js`, the new check of the property key. Hand check: open one ticket that had a note before the deploy | `npm test` |
| 3, a coding agent sees Dogear | `e2e/agent-checkpoint.spec.js`, `test/tools.test.js`, `test/brand.test.js` | `npm test`, then `npm run e2e` |
| 4, the brand kit | `test/brand.test.js` | `npm test` |

`npm run lint` checks the manifest after the change of the keys.

**E2E:** `e2e/agent-checkpoint.spec.js`, "an agent saves and the panel shows it". The agent
saves with `save-dogear`, and the panel named Dogear shows the dogear.

### Chunks

Single chunk. One rename runs through the source, the tests and the docs, and a split leaves
the tests red between the chunks.

### Risks

| Risk | Mitigation |
| ---- | ---------- |
| The new tool keys reset the admin switch "Expose tools to MCP-compatible apps", or the consent. | Hand step 3. The e2e test of the tools fails with a clear message if the switch is off. |
| `forge deploy` stops and asks for a major version, as it did for the `llm` module. | Deploy with `--approve MAJOR_VERSION_RULE`, then run `forge install --upgrade`, as `docs/learnings/forge-llm.md` says. |
| The header match `/^Dogear/` in `e2e/panel.js` also takes a button named "Dogears". | The match ends at the word: "Dogear" and then no "s". |
| A hand step is skipped, and the site still shows "Stand Note". | The build report lists the four hand steps. Scenario 1 stays a hand check until Dzafran confirms it. |
| The icon of the panel and of the tab is not in this slice. Until `judge-ready-entry`, Jira shows its generic icon there. | Accepted with O6. The rehearsal of `judge-ready-entry` checks the icon. |
| An agent of the developer still has the old rule text and calls a tool that is gone. | Hand step 4. |

### Decisions to record

Recorded as D29, D30, D31.

## Open items

| ID  | What | Type | Raised at | Owner | Status | Answer |
| --- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1  | A judge installs "Dogear", and then looks for it on a ticket. The panel's title is "Stand note" and the tab's title is "Stand notes". Do the titles change? | question | spec p1 | user | Resolved | Yes, and the note changes too: "be consistent". The note is a "dogear" in each text that a person or an agent sees: the panel title "Dogear", "No dogear yet", "Use as dogear", the tab "Dogears", and the tools `get-dogear` and `save-dogear`. The stored property keeps its key. Shipped specs keep their old text. This replaces O6 of `judge-ready-entry`, which kept "stand note" for the note. Drafted as D29. 2026-11-23 |
| O2  | The repo becomes public in `judge-ready-entry`. Its name on GitHub is `CodegeistHackathon`. Does the repo get the name `dogear`? | question | spec p1 | user | Resolved | Yes. The public link reads `github.com/dzaffren/dogear`, and GitHub forwards the old link. 2026-11-23 |
| O3  | Which tagline goes with the name? | question | spec p1 | user | Resolved | "Mark where you stopped." It says what a dog-ear does. 2026-11-23 |
| O4  | Trademark trackers show no live US mark DOGEAR for software. Three old applications for software are dead: 77338159, 97416162 and 98265832. One live mark, "D DOGEAR", covers bags, in class 18. The trackers can lag the register, and nobody searched outside the US. | flag | spec p1 | user | Accepted risk | Go on with Dogear. The entry is a hackathon project with no Marketplace listing, and the US trackers show no live mark for software. Accepted 2026-11-23 |
| O5  | Which logo concept does the kit use: A, Fold-ear; B, Folded D; or C, Corner? | question | spec p2 | user | Resolved | None of the three. Another session drew a second round, and Dzafran chose Page pup there. Its kit is in `docs/design/logo/kit`, from commit `38d4f32`. A check of the kit against scenario 4 found each file, and the SVG audit of the two symbols found no issue. Drafted as D30. 2026-11-23 |
| O6  | A UI Kit app can show its own icon file on the panel header and on the project tab. The manifest schema of Forge CLI 15.1.0 has an `icon` text of 255 characters at most on both modules. The docs call the panel's icon "the absolute URL of the icon". For the project page they say "a relative path from a declared resource". They describe a folder of static files only for Custom UI. | unproven | spec p3 | poc | Resolved | No spike. The icon is a PNG at a public web address. The address works only when the repo is public, so the manifest lines and the check at 16 pixels move to `judge-ready-entry`. Scenario 2 lost its icon lines. Drafted as D31. 2026-11-23 |
| O7  | The developer console lets a developer set the avatar of a Forge app. The docs say that the name "can be changed in Settings". They say nothing on an avatar. Scenario 1 rests on it. | unproven | spec p3 | poc | Resolved | Yes. Dzafran opened the Settings of the app in the developer console on 2026-11-23. The app shows as "Stand note" with the default avatar, the letter S, and Settings has a field for the avatar. Hand step 1 uploads the avatar from the kit. 2026-11-23 |
| O8  | Scenario 3 said "Then the server's name is "Dogear"". A probe on 2026-11-23 showed that Atlassian's MCP server reports the name `integrations-service` for each app. The name in the manifest does not reach the agent. | flag | spec p3 | user | Resolved | Scenario 3 checks the two tool names, and that the README adds the server under the name "dogear". The server name in the manifest still becomes Dogear. 2026-11-23 |
| O9  | The approved description of `save-dogear` ended "Call it after each finished step, and before the session stops." It had 273 characters, and `forge lint` allows 255 for the description of an action. | flag | build | user | Decided alone | Chose: end it with "Call it after each step, and before you stop.", which makes 255 characters. The sentence that says what a dogear is stays. Other: drop that sentence, as before the rename. Undo: change the description in `manifest.yml`, and keep it at 255 characters or fewer. 2026-11-23 |

_Never delete this section or its rows. See references/ledger.md._

## Glossary

- **Dogear (the app)** — the new name of the app. A dog-ear is the folded corner of a page.
- **Dogear (the note)** — the short note on a ticket that says where the work stands: done, next, watch out. Its old name was "stand note".
- **Brand kit** — one folder with the logo files, the icon files, the colours, the typeface and the rules for their use.
- **Symbol** — the picture part of a logo, with no letters.
- **Wordmark** — the name of the product, drawn as letters in the logo's typeface.
- **Lockup** — the symbol and the wordmark in one fixed layout.
- **Tagline** — one short line that goes with the name.
- **Forge** — Atlassian's platform for apps that run inside Jira and its other products.
- **Avatar** — the small picture of an app on Atlassian's screens.
- **Developer console** — Atlassian's site where a developer manages a Forge app: its name, its icon and its installs.
- **Manifest** — the file `manifest.yml`, which says what the app adds to Jira.
- **MCP** — Model Context Protocol, the standard way an AI agent calls outside tools.
- **MCP server** — the address where an agent finds the tools of the app.
- **Spike** — a short test with throwaway code that answers one risky question.
- **Custom UI** — the other way to build a Forge screen: the app ships its own web page. This app uses UI Kit.
- **UI Kit** — Forge's set of ready-made screen parts, such as buttons and messages.
- **Devpost** — the site that runs the hackathon and takes the entry.
- **Page pup** — the chosen logo: a page with a dog's face, whose folded corner is the ear.
- **SVG, PNG** — two image formats. SVG holds shapes and scales to any size. PNG holds pixels.
- **e2e** — end to end. An e2e test uses the app as a user does.
- **D1, D3** — entries in `DECISIONS.md`.
