# Dogear brand

**Version:** v1 · **Status:** Draft · **Type:** Enhancement · **Project type:** Web UI

**Shape doc:** docs/specs/ticket-handover/shape.md
**Depends on:** stand-note, agent-checkpoint, at-risk-list, pick-up-brief

The app and its note get one name, Dogear, with a logo, an icon, and one brand kit for the
guide, the Devpost entry and the video. It ships now because the production deploy, the guide and the
video of `judge-ready-entry` carry the name and the icon.

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
| One e2e test walks it         | yes — open the site's list of apps, a ticket and the Dogears tab, and read the name and the icon in each |
| Worth shipping alone          | yes — a person who installs the app sees one word and one mark in each place |
| Fits (≤5 scenarios, ≤2 areas) | yes — 4 scenarios, two areas: the app in Jira, and the brand kit |

**Path:** full — a new name in each text and tool, a new logo, and new files that other work uses.

## User story

As a Codegeist judge, I want one word and one mark on the install screen, the ticket, the
agent's tools and the video, so that I know that they are one product.

## Flow

```mermaid
flowchart LR
    J((Priya, a site admin)) -- "opens the install screen" --> I["Install screen: Dogear, with its icon"]
    I -- "installs, then opens a ticket" --> P["Panel: Dogear, with the icon"]
    P -- "opens the tabs of the project" --> T["Tab: Dogears, with the icon"]
    J -- "lists the MCP servers in a coding agent" --> C["Server: Dogear, with get-dogear and save-dogear"]
    D((Dzafran)) -- "takes the logo, the colours and the typeface" --> K["Brand kit in docs/design/logo/kit"]
    K -- "used by judge-ready-entry" --> G["Guide, Devpost entry, video"]
```

Priya sees the word Dogear and its icon at the install, on the ticket, on the project tab
and in the agent. Dzafran builds the guide, the Devpost entry and the video from one kit.

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
  Then the panel header shows the Dogear icon beside the title "Dogear"
  And the panel shows the note from 2026-11-21, with its four texts
  When Aisyah opens a ticket with no note
  Then the panel says "No dogear yet"
  And the tab of project PAY has the title "Dogears", with the same icon
  And no text of the panel or of the tab says "stand note"
  And the icon reads at 16 pixels in Jira's light theme and in its dark theme

Scenario: A coding agent sees Dogear
  Given a coding agent is connected to the MCP server of the app
  When Dzafran lists the MCP servers and their tools in the agent
  Then the server's name is "Dogear"
  And its tools are "get-dogear" and "save-dogear"
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
- The app icon, on the app in Atlassian's lists, on the panel and on the Dogears tab.
- A brand kit: the logo files, the icon files, the colours, the typeface, the tagline, the
  thumbnail for Devpost, and short guidelines.

**Out:**

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
    K -- "icon file in the manifest" --> P["Panel header: icon, Dogear"]
    K -- "icon file in the manifest" --> T["Project tab: icon, Dogears"]
    M["Manifest: name of the MCP server"] -- "Dogear" --> C["Agent: server Dogear, get-dogear, save-dogear"]
    K -- "lockup, colours, typeface" --> O["Outside Jira: README, Devpost thumbnail, video title card"]
```

The kit gives the app its avatar and the icon of the panel and the tab. The manifest gives
the agent the server's name. The README, the Devpost entry and the video take the lockup,
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
| MCP server name | Stand Note | Dogear |
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
  whole dogear: send each field that is still true. Call it after each finished step, and
  before the session stops."

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
| Panel and tab icon, 16 to 24 pixels | `svg/dogear-symbol-small.svg` |
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

## Decisions to record

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

## Open items

| ID  | What | Type | Raised at | Owner | Status | Answer |
| --- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1  | A judge installs "Dogear", and then looks for it on a ticket. The panel's title is "Stand note" and the tab's title is "Stand notes". Do the titles change? | question | spec p1 | user | Resolved | Yes, and the note changes too: "be consistent". The note is a "dogear" in each text that a person or an agent sees: the panel title "Dogear", "No dogear yet", "Use as dogear", the tab "Dogears", and the tools `get-dogear` and `save-dogear`. The stored property keeps its key. Shipped specs keep their old text. This replaces O6 of `judge-ready-entry`, which kept "stand note" for the note. Drafted as D29. 2026-11-23 |
| O2  | The repo becomes public in `judge-ready-entry`. Its name on GitHub is `CodegeistHackathon`. Does the repo get the name `dogear`? | question | spec p1 | user | Resolved | Yes. The public link reads `github.com/dzaffren/dogear`, and GitHub forwards the old link. 2026-11-23 |
| O3  | Which tagline goes with the name? | question | spec p1 | user | Resolved | "Mark where you stopped." It says what a dog-ear does. 2026-11-23 |
| O4  | Trademark trackers show no live US mark DOGEAR for software. Three old applications for software are dead: 77338159, 97416162 and 98265832. One live mark, "D DOGEAR", covers bags, in class 18. The trackers can lag the register, and nobody searched outside the US. | flag | spec p1 | user | Accepted risk | Go on with Dogear. The entry is a hackathon project with no Marketplace listing, and the US trackers show no live mark for software. Accepted 2026-11-23 |
| O5  | Which logo concept does the kit use: A, Fold-ear; B, Folded D; or C, Corner? | question | spec p2 | user | Resolved | None of the three. Another session drew a second round, and Dzafran chose Page pup there. Its kit is in `docs/design/logo/kit`, from commit `38d4f32`. A check of the kit against scenario 4 found each file, and the SVG audit of the two symbols found no issue. Drafted as D30. 2026-11-23 |

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
- **Developer console** — Atlassian's site where a developer manages a Forge app: its name, its icon and its installs.
- **Manifest** — the file `manifest.yml`, which says what the app adds to Jira.
- **MCP** — Model Context Protocol, the standard way an AI agent calls outside tools.
- **MCP server** — the address where an agent finds the tools of the app.
- **UI Kit** — Forge's set of ready-made screen parts, such as buttons and messages.
- **Devpost** — the site that runs the hackathon and takes the entry.
- **Page pup** — the chosen logo: a page with a dog's face, whose folded corner is the ear.
- **SVG, PNG** — two image formats. SVG holds shapes and scales to any size. PNG holds pixels.
- **e2e** — end to end. An e2e test uses the app as a user does.
- **D1, D3** — entries in `DECISIONS.md`.
