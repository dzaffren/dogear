# Judge-ready entry

**Version:** v1 · **Status:** Shipped · **Type:** Feature · **Project type:** Web UI

**Shape doc:** docs/specs/ticket-handover/shape.md
**Depends on:** stand-note, agent-checkpoint, at-risk-list, pick-up-brief, dogear-brand

A Codegeist judge installs Dogear from a link, follows a guide, and sees it work in two
minutes. It ships now because the video and the Devpost entry of `submit-entry` need a
production app that a stranger can install, before 2026-12-22 at 12:00 Pacific Time.

## Problem

The app runs only in the development environment of `dzaffren.atlassian.net`. A judge has
no link to install it, and the README is a guide for the developer, not for a judge.

The judges score from 2027-01-05 to 2027-02-03, on their own Jira sites, with no help from
the developer. An entry that a judge cannot install fails the first stage.

### What the official rules ask

From the official rules on Devpost, which Dzafran pasted on 2026-11-23 (O5):

- The app installs in a judge's test environment from an installation link, and it works as
  the video and the text say.
- The entry gives each step that a judge needs to set the app up, with each integration.
- The video is shorter than 5 minutes, and judges need not watch more. It shows the app at
  work, and it is public on YouTube.
- The video has no third-party trademark, and no music or other material under copyright,
  unless the entrant has permission.
- The entry has a text description, says how it meets the Forge requirement, and names its
  category and its bonus prizes, with a write-up for each bonus prize.
- Each material is in English.
- The bonus prize "Best app with Atlassian MCP" is for a Forge app that exposes tools
  through the `rovo:mcp` module. The rules add that open-source `skill.md` files for
  third-party agents can go with it.
- Stage one is pass or fail: the entry fits the theme and uses Forge. Stage two has five
  criteria of equal weight:

| Criterion | The judges' question |
| --- | --- |
| Technological implementation | Is it a real, working, non-trivial app when tested, and not one fixed demo path? |
| Design | Is it a complete, coherent product, and not only a technical proof? |
| Potential impact | Is the case credible and specific, for a real problem and a real audience? |
| Innovation | How new is the idea, and how does it differ from what exists? |
| Presentation | Does the video show the app work end to end? Does the pitch say what problem, for whom, and why it matters? |

- An entry is a draft on Devpost until the entrant submits it. After the deadline, nothing
  changes.
- One entry can win one category prize and one bonus prize. The first 300 eligible entries
  get a swag pack, in the order of their arrival.

## Slice test

| Check                         | Result |
| ----------------------------- | ------ |
| Cuts every layer it needs     | yes — the production deploy, the installation link, the icon, the public repo with the skill file, and the guide |
| One e2e test walks it         | yes — one rehearsal as a judge: start at the guide, install on a clean site, do each step |
| Worth shipping alone          | yes — a judge can score the entry, and any Jira site can install the app |
| Fits (≤5 scenarios, ≤2 areas) | yes — 3 scenarios, two areas: the app in production, and the public repo with its guide |

**Path:** full — a production deploy, a public repo and a new guide.

The video and the Devpost entry split off as `submit-entry` on 2026-11-23 (O15).

## User story

As a Codegeist judge, I want to install Dogear and see it work in two minutes, so that
I can score it with no help from the developer.

## Flow

```mermaid
flowchart LR
    J((Priya, a judge)) -- "opens the guide" --> G[Judge's guide on GitHub]
    G -- "opens the installation link" --> I[Atlassian install screen]
    I -- "picks a site and installs" --> S[Priya's Jira site with Dogear]
    G -- "Try it in two minutes, on one ticket" --> S
    G -- "Connect a coding agent" --> C[Claude Code with the dogear tools]
    C -- "reads and saves the dogear" --> S
```

Priya starts at the guide. Priya installs the app from the link, and follows the guide on
one ticket. A judge with Claude Code also connects the agent's tools. The Devpost entry of
`submit-entry` links to the guide.

## Acceptance criteria

```gherkin
Scenario: A judge installs the app from the link
  Given the judge's guide of Dogear shows the installation link
  And Priya Nair is the admin of a Jira site where Dogear was never installed
  And Priya is not the developer of Dogear
  When Priya opens the link, picks that site and installs the app
  Then the install ends with no error
  And a ticket of that site shows the Dogear panel in the right column
  And the Dogear panel and the Dogears tab show the Dogear icon, in Jira's light theme and in its dark theme

Scenario: The judge sees the app work in two minutes
  Given Dogear is installed on Priya's site
  And the guide's part "Try it in two minutes" gives the summary and the description of one ticket
  When Priya makes that ticket, "Refund fails on a partial capture", and moves it to In Progress
  Then the Dogears tab of the project lists the ticket with "No dogear"
  When Priya opens the ticket and selects "Build a brief from Jira"
  Then the panel shows a brief with the headings Done, Next, Watch out and Code
  When Priya selects "Use as dogear" and selects Save
  Then the panel shows the dogear with "Saved by Priya Nair, just now"
  And the Dogears tab does not list the ticket
  And the rehearsal of this part takes 2 minutes or less on a stopwatch

Scenario: The judge connects a coding agent
  Given Dogear is installed on Priya's site
  And the ticket "Refund fails on a partial capture" has the dogear from the second scenario
  And Priya has Claude Code on a laptop
  When Priya follows the guide's part "Connect a coding agent"
  Then the skill file from the guide's link opens on GitHub with no sign-in
  And Claude Code lists the two tools under the names that the guide gives
  And "Read the dogear" in Claude Code answers with the text of the dogear
  When Claude Code saves a dogear with Next "Add a test for a capture of 40 of 100 MYR"
  Then the Dogear panel of the ticket shows that Next
```

## Scope

**In:**

- A deploy of Dogear to the production environment of Forge, and an installation link
  that works on a site of another person.
- The icon of the Dogear panel and of the Dogears tab in Jira, as a file in the app (D38).
- This repo becomes public on GitHub, with a licence and the skill file for coding agents.
  A check of the files and the git history for secrets comes first. Dzafran makes the repo
  public.
- A judge's guide with three parts: install, "Try it in two minutes", and "Connect a coding
  agent". It names each thing that a site needs first, as the rehearsal finds it.
- One rehearsal on a clean site, with a stopwatch. It includes one pick-up brief in
  production.

**Out:**

- The demo video, the text of the Devpost entry, the figure for the pitch and the
  submission — `submit-entry`, the next slice.
- A listing on the Atlassian Marketplace — not planned. D1 aims for one bonus prize.
- A button that makes sample tickets on the judge's site — not planned. See O2.
- The rename of the app to Dogear, the logo, the app's avatar and the brand kit that the
  guide, the Devpost entry and the video share — `dogear-brand`, which shipped on 2026-11-23.
- New features, and fixes that a judge does not hit — not planned before the deadline.
- Help for a judge during the scoring, such as a support address — not planned.

## Interface

This slice adds no screen to the app. Its interface is what a judge meets: the guide, the
skill file, and one icon in Jira.

**Design system:** inside Jira, Forge UI Kit (D3), with one new icon and no new component.
Outside Jira, the brand kit of `dogear-brand`: `docs/design/logo/kit/guidelines.md` gives
the logo, the three colours and the typeface.

**Motion tier:** 0. UI Kit gives the app no control of motion.

**Preview:** none. Each text is a Markdown file that the build writes.

```mermaid
flowchart LR
    G["Judge's guide: GUIDE.md on GitHub"] -- "installation link" --> I["Install screen: Dogear, with its avatar"]
    I -- "installs" --> J["Jira: Dogear panel and Dogears tab, with the icon"]
    G -- "the text of one ticket" --> J
    G -- "skill file link" --> S["Skill file on GitHub"]
    S -- "rule text" --> C["Coding agent"]
    C -- "get-dogear, save-dogear" --> J
```

The guide is the door. It gives the installation link and the text of one ticket, and it
links to the skill file.

### The judge's guide

One page, in English: `GUIDE.md` at the root of the public repo. The first line of the
README links to it. Each step is one action and what the judge then sees.

| Part | What it has |
| ---- | ----------- |
| Before you start | A Jira site where you are an admin. For the last part only: Claude Code. |
| 1. Install | The installation link. Pick the site. Open a ticket, and select Allow access in the Dogear panel. |
| 2. Try it in two minutes | Six steps on one ticket, below. |
| 3. Connect a coding agent | Turn on "Expose tools to MCP-compatible apps". Add the server as `dogear`. Sign in. Add the skill file. Two prompts to try: "Read the dogear of" the ticket, and "Save a dogear" with a new Next. |
| If a step fails | Each failure that the rehearsal finds, with its fix. |

**Try it in two minutes:**

1. Make a ticket with the summary and the description below. Move it to In Progress.
2. Open the Dogears tab of the project. It lists the ticket with "No dogear".
3. Open the ticket. In the Dogear panel, select "Build a brief from Jira".
4. Read the brief: Done, Next, Watch out, Code.
5. Select "Use as dogear", then Save. The panel shows "Saved by" your name.
6. Open the Dogears tab again. The ticket is gone from the list.

**The ticket's text**, which the judge copies:

> Summary: Refund fails on a partial capture
>
> Description: A refund fails with error 422 when the order was captured in part. Example:
> the order is for 100 MYR, the capture is 40 MYR, and a refund of 40 MYR is refused. The
> refund check compares the refund with the authorised amount and not with the captured
> amount. Done: the failure is reproduced on staging, and `refund.test.js` has a failing
> test for it. Next: fix the check in `refundService.js`. Watch out: do not change the path
> for a full capture. Branch: `fix/partial-capture-refund`.

The description names something for each heading, so the brief has no "Not known" line.

### The skill file

The skill file is `skills/dogear/SKILL.md`, in the folder form that Claude Code loads as a
skill: a name, a description, and the rule text. The guide gives the same rule text as a
block for `AGENTS.md`, for other agents. The rule text is what the README has today under
"## Dogear": take the
ticket key from the branch, read the dogear first, save after each step and before you
stop, read before each save, write for a teammate. It names the two tools.

## Technical plan

### Approach

The app gets no new behaviour. The slice adds one icon file to the app, three text files to
the repo, and one production release. Most of the work is a fixed order of steps, and some
steps are Dzafran's by hand: the developer console, the public repo, the second account and
the rehearsal. A spike on 2026-11-23 and 2026-11-24 proved the bundled icon and the
production deploy (O16, O19). Production is deployed as version 2.0.0, with its own signing
key, and no site has it installed.

Relies on: D1, D3, D4, D12, D13, D14, D25, D29, D30, D32, D33, D34, D35, D36, D37, D38

```mermaid
flowchart TB
    subgraph repo["Public repo dzaffren/dogear"]
        GD["GUIDE.md"]
        SK["skills/dogear/SKILL.md"]
        LI["LICENSE"]
        MF["manifest.yml with the icon"]
        IC["static/icons/dogear.svg"]
    end
    subgraph atl["Atlassian"]
        CON["Developer console: name, avatar, sharing link"]
        PROD["Forge production environment"]
        SITE["A judge's Jira site"]
        MCP["MCP server"]
    end
    MF -- "npm run deploy:prod" --> PROD
    IC -- "bundled in the deploy" --> PROD
    CON -- "installation link" --> GD
    GD -- "link and steps" --> SITE
    PROD -- "panel, tab, tools" --> SITE
    SK -- "rule text" --> AG["Coding agent"]
    AG -- "get-dogear, save-dogear" --> MCP
    MCP -- "calls as the person" --> SITE
```

The repo gives the judge the guide and the skill file. The deploy gives each site the app
with its icon. The console gives the link that the guide carries.

```mermaid
sequenceDiagram
    participant P as Priya, a judge
    participant G as GUIDE.md on GitHub
    participant A as Atlassian install screen
    participant J as Priya's Jira site
    participant L as Forge LLM
    P->>G: opens the guide
    P->>A: opens the installation link, picks the site
    A-->>J: installs Dogear, production
    P->>J: opens a ticket, selects Allow access
    P->>J: selects "Build a brief from Jira"
    J->>L: rules and ticket text
    L-->>J: the brief
    P->>J: "Use as dogear", Save
    J-->>P: "Saved by Priya Nair, just now"
```

This is the path of the first two scenarios. The third scenario adds the admin switch, the
MCP sign-in and the two tools.

### Order of work

| # | Who | Step |
| - | --- | ---- |
| 1 | build | Check each file and the whole git history, on each branch, for keys and for secret files. Stop when it finds one. |
| 2 | build | Set the noreply address as the author in this clone. Give each commit of `main` and of this branch that author. Ask Dzafran, then force-push `main`, and delete the four merged branches on GitHub. |
| 3 | build | The icon: the file, the manifest, the test. Deploy to development, and run the e2e tests. |
| 4 | build | `LICENSE`, `skills/dogear/SKILL.md`, `GUIDE.md`, the README, and the script `deploy:prod`. |
| 5 | build | `npm run deploy:prod`. The icon makes a minor version. |
| 6 | Dzafran | In the developer console: name the app Dogear and upload the avatar. Rename the repo to `dogear`. Make the repo public. |
| 7 | build | Ask Dzafran, then push this branch. Check with no sign-in that the guide and the skill file open. |
| 8 | Dzafran | In the developer console: Distribution, Sharing, fill the app details, and copy the installation link. The build puts the link in the guide. |
| 9 | Dzafran | Sign up the second Atlassian account and make its free Jira site. Do the rehearsal there by the guide, with a stopwatch. |
| 10 | build | Write the rehearsal's result to `docs/entry/rehearsal.md`. Fix what the rehearsal found, and deploy again if the app changed. |

Steps 6 and 8 are apart because the sharing form can ask for a privacy policy address. If it
does, the build adds `PRIVACY.md`, and the public repo gives its address.

### Changes

| File | Change | For |
| ---- | ------ | --- |
| `static/icons/dogear.svg` | New. A copy of `docs/design/logo/kit/svg/dogear-symbol-small.svg`. | Scenario 1 |
| `manifest.yml:8`, `:16`, `:84-88` | `icon: resource:icons;dogear.svg` under the panel and under the tab. A resource `icons` with the path `static/icons`. | Scenario 1 |
| `package.json:13` | A script `deploy:prod`: the line of `deploy`, with `-e production`. | Scenario 1 |
| `LICENSE` | New. The MIT text, as `package.json:5` already says. | Scenario 3 |
| `skills/dogear/SKILL.md` | New. A name, a description, and the rule text from `README.md:66-82`. | Scenario 3 |
| `GUIDE.md` | New. The parts and the ticket's text from the Interface section, the installation link, and the command `claude mcp add --transport http dogear https://mcp.atlassian.com/forge/62f3c556-f63e-43bf-9033-8c2d41e14c00`. | Scenarios 1, 2, 3 |
| `README.md:5` | One line under the tagline that links to `GUIDE.md`. | Scenario 1 |
| `README.md:48-84` | The part "Connect a coding agent" becomes a pointer to the guide and to the skill file, so the rule text has one home. The part on the e2e tests stays. | Scenario 3 |
| `test/brand.test.js:33-37` | The check of the `claude mcp add` line reads `GUIDE.md`. New checks: the icon lines and the icon file, the licence, the skill file with the two tool names, the guide's three parts and its ticket text, and the same rule lines in the guide and in the skill file. | Scenarios 1, 2, 3 |
| `docs/entry/rehearsal.md` | New. The date, the site, each step with its result, the stopwatch time, the icon in the dark theme, and each failure with its fix. | Scenarios 1, 2, 3 |

The guide tells the judge this order, which the spike found: install, open the panel and
select Allow access, turn on the admin switch, and only then add the server and sign in. A
sign-in from before the install does not list the tools.

### Earn-it

| New thing | What demands it |
| --------- | --------------- |
| The resource `icons` and one SVG file | Scenario 1: the panel and the tab show the icon. |
| `GUIDE.md` | Scenarios 1 to 3, and D35. |
| `skills/dogear/SKILL.md` | Scenario 3, and D36. |
| `LICENSE` | D34: a public repo with no licence is not open source. |
| The script `deploy:prod` | The production deploy runs more than one time: now, and after each fix. |
| `docs/entry/rehearsal.md` | The rehearsal is the e2e test of this slice, and it runs by hand. The file is its record. |

No new dependency, and no new code in `src/`.

### Non-functionals

- **Load:** some tens of judges' sites from 2027-01-05 to 2027-02-03. Forge allows 100
  model requests a minute for each install.
- **What breaks first at 10 times:** the model bill. Each brief costs about 1 US cent, and
  D25 stops a site at 50 briefs a day.
- **Security:** the repo becomes public, so step 1 checks the history first. `.env` and
  `e2e/.auth/` stay out of git. The production signing key is only in Forge. Any site admin
  with the link can install the app. The scopes do not change. Dzafran's Gmail address
  stays in the five merged pull requests (O20).
- **Proof in production:** `bash scripts/forge.sh logs -e production` shows
  `dogear saved issue=` with the ticket key of the rehearsal, from the other person's site
  too.
- **Rollout:** no flag. A later deploy with no new scope is a minor version, and each site
  gets it by itself. To roll back: check out the last good commit and run
  `npm run deploy:prod`. To stop new installs: turn Sharing off in the console.

Production stays deployed, and the Forge account stays able to pay, until 2027-02-03.

### Test plan

| Scenario | Proof | Command |
| -------- | ----- | ------- |
| 1, install from the link | The rehearsal, steps of the guide's part 1. The icon in the light theme and in the dark theme, on the rehearsal site. | by hand, on the clean site |
| 1, the icon in the app | `test/brand.test.js`, and the e2e tests on development still pass | `npm test`, then `npm run deploy` and `npm run e2e` |
| 2, two minutes | The rehearsal with a stopwatch: 2 minutes or less from the new ticket to the empty tab | by hand, on the clean site |
| 3, the coding agent | The guide and the skill file answer with no sign-in. The rehearsal: the two tools are listed, a read answers, and a save shows in the panel. | `curl -sI` on both addresses, then by hand |

The e2e test that walks the slice is the rehearsal (D33). It runs by hand, because the
install, the consent and the admin switch are steps of a person on a site of another
account. `docs/entry/rehearsal.md` is its record. The Playwright tests stay on the
development site, as the guard for the app itself.

Before the merge, the guide is on this branch, so the rehearsal opens it at the branch's
address. After the merge, `/ship` checks the same two addresses on `main`.

### Chunks

Single chunk. The steps run in one order, and half of them wait for a step by hand.

### Risks

| Risk | What we do |
| ---- | ---------- |
| The sharing form asks for a field that nobody has, such as a privacy policy address. | The build adds `PRIVACY.md` to the public repo. |
| On a clean free site, the brief or the tools do not work as on Dzafran's site. | The rehearsal finds it with four weeks left. The guide's last part gets the fix, or the thing that a site needs first. |
| A second key replaces the production signing key, and each dogear on a judge's site loses its author. | Nobody sets `NOTE_SIGNING_KEY` for production again. The guide for the developer says so. |
| The production app goes on `dzaffren.atlassian.net`, and the e2e tests then see two panels. | Production is never installed on that site. |
| The icon is hard to see in Jira's dark theme. | A rendered sample at 16 pixels on Jira's dark grey looks clear. The rehearsal checks the site. |
| The force-push of `main` breaks a clone or an open pull request. | No pull request is open, and this is the only clone. The build asks before the push. |

### Decisions to record

Recorded as D32, D33, D34, D35, D36, D37, D38.

## Review

2026-11-24 · 3 raw findings, 1 survived, 1 fixed, 1 lead needs validation.

- correctness · `README.md:60` · the e2e setup names Allow access and the tools switch, not part 1 of the guide · `8497789`
- needs validation · `skills/dogear/SKILL.md:14` · whether the model runs a shell command that it reads in a Watch out field when the skill says to obey that field · on a test ticket, save a dogear whose Watch out asks for `touch /tmp/dogear-probe`, ask Claude Code with the skill to start work on that ticket, and deny the command if it asks

## Open items

| ID  | What | Type | Raised at | Owner | Status | Answer |
| --- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1  | The pitch has no number for how often a ticket changes hands or what a bad handover costs. Judges score a "credible, specific case". Which number does the pitch use? (from shape O7) | flag | shape | user | Resolved | Published surveys: Atlassian's State of Developer Experience 2025 and the Stack Overflow survey of 2022. They measure lost time and knowledge silos, not handovers alone. The build reads each figure at its primary source, and the video shows one with its source. Drafted as D39. 2026-11-23. The figure in the video is from Atlassian's report, because the rules bar third-party trademarks in the video. 2026-11-23 |
| O2  | A judge's site has no stand notes. How does the judge get a worked example? | question | spec p1 | user | Resolved | The guide only. It gives the text of one ticket, and the judge makes the ticket. The app gets no new code. Drafted as D32. 2026-11-23 |
| O3  | The rehearsal needs a clean site: Stand Note never installed, and an admin who is not the developer. Who makes it? | question | spec p1 | user | Resolved | Dzafran signs up a second Atlassian account with another email and makes a free Jira site. Drafted as D33. 2026-11-23 |
| O4  | How is the demo video made? | question | spec p1 | user | Resolved | The same way as the videos of KinCart and Fire Watch: the screen-demo pipeline of OpenMontage. Playwright records the browser, a paid text-to-speech voice reads the script, and Remotion joins them with titles and captions. The Claude Code part is a terminal, so pause 3 plans its capture. Drafted as D40. 2026-11-23 |
| O5  | Assuming the rules are as three secondary pages give them: an installation link with instructions, a public YouTube video under 5 minutes that covers the bonus prize, a text description, and five criteria at 20% each. Devpost refused the read of the official page. One page also says "no third-party trademarks" in the video, and the video shows Claude Code. | assumption | spec p1 | user | Resolved | Dzafran pasted the official rules on 2026-11-23, after Chrome hit a bot check. The secondary pages were right, with three changes. The video limit is 5 minutes, with no 3-minute clause. The rule on third-party trademarks is real: see O7. The three prizes are for each category. The Problem section lists what the rules ask. 2026-11-23 |
| O6  | The working name is Stand Note. Is it the name of the entry? | question | spec p1 | user | Resolved | No. The name is Dogear: the folded page corner that marks where a reader stopped. The note in the panel stays a "stand note". Understudy was the first pick, but a US trademark application for UNDERSTUDY is pending for AI developer tools, and an open-source AI agent has the name. A web search found no product named Dogear. Nobody searched the trademark register. 2026-11-23. Changed by O1 of `dogear-brand` on 2026-11-23: the note is a "dogear" too. The texts of this spec follow at its next pause. |
| O7  | The rules say that the video "must not include third party trademarks" with no permission. The video shows Claude Code, which is Anthropic's name and logo. | flag | spec p1 | user | Resolved | Hide the brand. The video shows the agent's terminal at work, with no product name and no logo, and the voice says "a coding agent". The written guide still names Claude Code, because a judge needs the exact steps. 2026-11-23 |
| O8  | The text of the MCP bonus prize names open-source `skill.md` files that users add to their agents. The README has that text as a block to copy, and this repo is private. Does the entry ship a public skill file? | question | spec p1 | user | Resolved | Yes. This repo becomes public on GitHub, with the skill file in it and a licence. A check of the files and the git history for secrets comes first. Dzafran makes the repo public. Drafted as D34. 2026-11-23 |
| O9  | Judges score design at 20%: "a complete, coherent product". The app has Forge's default icon. Is an icon for Dogear in this slice? | question | spec p1 | user | Resolved | No. The rename, the logo, the icon and the shared look are their own slice, `dogear-brand`, which ships first. This slice depends on it. A third area would break the size limit of this spec. 2026-11-23 |
| O10 | From O6 of `dogear-brand`: the icon of the panel and of the Dogears tab is a PNG at a public web address. This slice adds the address to the manifest after the repo is public, and checks the icon at 16 pixels in Jira's light theme and in its dark theme. | flag | spec p1 | user | Resolved | Dzafran chose the web address on 2026-11-23, in `dogear-brand`. Recorded there as D31. The scenarios of this spec take it in at the next pause. 2026-11-23 |
| O11 | Where does the judge's guide live? | question | spec p2 | user | Resolved | `GUIDE.md` at the repo root. The first line of the README links to it, and so does the Devpost entry. The README stays the developer's page. Drafted as D35. 2026-11-23 |
| O12 | Assuming the Devpost form of Codegeist has the usual Devpost fields: name, tagline, a story in Markdown, built with, links, a video link, a thumbnail and a gallery. Devpost refuses automated reads, so nobody saw the form. | assumption | spec p2 | user | Accepted risk | The build writes each text to a Markdown file for the usual fields. When Dzafran starts the draft on Devpost, Dzafran pastes the form's field list, and the build fits the texts then. A wrong guess costs a change of text, not of the app. 2026-11-23 |
| O13 | How long is the video? The rules allow less than 5 minutes, and judges need not watch more. | question | spec p2 | user | Resolved | About 3 minutes, in six beats. 2026-11-23 |
| O14 | Which form and place does the skill file have? The bonus prize text says "open-source `skill.md` files". | question | spec p2 | user | Resolved | `skills/dogear/SKILL.md`, in the folder form that Claude Code loads as a skill. The guide gives the same rule text as a block for `AGENTS.md`, for other agents. Drafted as D36. 2026-11-23 |

| O15 | This slice grew after pause 1: the icon, the public repo, the licence, the skill file and a secrets check. Does the video and the Devpost entry split off? | question | spec p3 | user | Resolved | Yes. `submit-entry` takes the fourth and fifth scenarios, "The demo video is public" and "The entry is submitted", with the Devpost and video parts of the Interface and the drafts D39 and D40. The rows O1, O4, O5, O7, O12 and O13 stay here as the record, and `submit-entry` carries their answers. 2026-11-23 |
| O16 | The Forge docs say that a UI Kit app can bundle its icon: `icon: resource:<key>;<path>`. D31 chose a public web address because a bundled file was not proven. Does a bundled icon show in the panel and in the tab, in the light theme and in the dark theme? | unproven | spec p3 | poc | Resolved | Yes, in the light theme. A spike on 2026-11-23 added a resource `icons` with the folder `static/icons`, and `icon: resource:icons;dogear.svg` on both modules, with the kit's `dogear-symbol-small.svg`. `forge lint` and the deploy took it, with a minor version. Jira served the file from `icon.cdn.prod.atlassian-dev.net`, and screenshots showed the icon beside "Dogear" in the panel and beside "Dogears" in the tab. Jira did not switch the test account to its dark theme, so dark was checked only on a rendered sample: the icon at 16 and 24 pixels on `#1D2125`. The rehearsal checks the dark theme on the site. Drafted as D38, which supersedes D31. 2026-11-23 |
| O17 | Four commits have Dzafran's Gmail address as the author. A public repo shows it. | flag | spec p3 | user | Resolved | Rewrite the history first. Before the repo is public, the author of those commits becomes GitHub's noreply address, and `main` is force-pushed. Each commit hash changes. Drafted as D37. 2026-11-23 |
| O18 | Forge LLM has no free quota. Each pick-up brief on a judge's site is billed to the developer: about 0.6 to 1.2 US cents with Claude Haiku, from the price table read on 2026-11-23. D25 caps a site at 50 briefs a day. | flag | spec p3 | user | Resolved | Accept the cost and keep the cap of 50. No code change. 2026-11-23 |
| O19 | The docs do not say three things about production: the names of the two MCP tools, whether a brief works with no payment method on the developer's Forge account, and whether one site can have the development and the production install at once. | unproven | spec p3 | poc | Resolved | A spike on 2026-11-23 and 2026-11-24 deployed version 2.0.0 to production and installed it on `dzaffren.atlassian.net`. The tool names in production are `get-dogear` and `save-dogear`, with no suffix. They showed only after the admin switch was on and after a new MCP sign-in: a sign-in from before the install listed only the development tools. A call of `get-dogear` by a person who had not opened the production panel answered "select Allow access". A pick-up brief worked with no billing step: the model answered in 3 seconds. One site held both installs, with two panels on a ticket. The production install is removed from that site again. Production stays deployed, with its own `NOTE_SIGNING_KEY`. 2026-11-24 |
| O20 | The five merged pull requests keep their old commits on GitHub, with Dzafran's Gmail address. A force-push of `main` does not remove them. | flag | spec p3 | user | Accepted risk | Force-push `main` and make this repo public. The address is gone from `main`, and it stays readable in the pull requests. Dzafran chose this over a new repo with a clean history. Drafted in D37. 2026-11-24 |
| O21 | The sharing form of the developer console asked for a support contact, a privacy policy, terms of service, a company and a personal data answer. The plan expected only a privacy policy. | flag | build | user | Decided alone | Chose: with Dzafran's answers on 2026-11-24, add `PRIVACY.md`, and fill the form with the GitHub issues page as the support contact, the privacy policy on GitHub, no terms, no company, and "No" for personal data, because the account ID stays in Jira on the customer's site. Other: answer "Yes" for personal data, or give an email as the contact. Undo: change the fields in Distribution in the developer console. 2026-11-24 |
| O22 | The sharing form fetches the privacy link with node-fetch, and refused the `main` address, where `PRIVACY.md` arrives only at the merge. | flag | build | user | Decided alone | Chose: the form has the branch's address, `https://github.com/dzaffren/dogear/blob/feat/judge-ready-entry/PRIVACY.md`, which answers 200. Other: merge first, then fill the form. Undo: after the merge and before the branch is deleted, Dzafran changes the field to the `main` address. `/ship` must not delete the branch until then. 2026-11-24 |
| O23 | The rehearsal checked the icon in the light theme only. | flag | build | build | Decided alone | Chose: the dark theme stays proven by the rendered sample at 16 and 24 pixels on `#1D2125` (O16), and the build goes on. Other: switch the rehearsal site to the dark theme and look before `/ship`. Undo: if the icon is hard to see, add a dark variant of `static/icons/dogear.svg`. 2026-11-24 |
| O24 | The rehearsal skipped part 3, connecting a coding agent. | flag | build | build | Decided alone | Chose: part 3 stays proven by the spike in production (O19: the tool names, the sign-in, a read) and by the 19 Playwright tests on development, which call both tools and see the save in the panel. Other: run part 3 on the rehearsal site before `/ship`. Undo: run it then and fix the guide for what it finds. 2026-11-24 |

_Never delete this section or its rows. See references/ledger.md._

## Glossary

- **Dogear** — the app. Also the short note on a ticket that says where the work stands: done, next, watch out, code. The note is a "dogear", with a small d.
- **Pick-up brief** — a short text that AI builds from a ticket's Jira data, for a person who picks up a ticket with no dogear.
- **Forge** — Atlassian's platform for apps that run inside Jira and its other products.
- **Devpost** — the site that runs the hackathon and takes the entry.
- **Codegeist** — Atlassian's yearly hackathon for Forge apps.
- **Production environment** — the Forge copy of the app that other sites install. The app runs only in the development copy today.
- **Installation link** — a link from Atlassian's developer console that lets an admin install the app on a site.
- **Clean site** — a Jira site where Dogear was never installed, with an admin who is not the developer.
- **Rehearsal** — one timed run through the entry as a judge, on the clean site.
- **Skill file** — a text file of instructions that a person gives to their own coding agent.
- **MCP** — Model Context Protocol, the standard way an AI agent calls outside tools.
- **Coding agent** — an AI tool that writes code for a developer, such as Claude Code.
- **Atlassian Marketplace** — Atlassian's public store for apps.
- **e2e** — end to end. An e2e test uses the app as a user does.
- **Force-push** — a push that replaces the history of a branch on GitHub.
- **Noreply address** — an email address from GitHub that hides the person's own address in a commit.
- **Minor version** — a new version of a Forge app that each site gets by itself. A major version needs the admin's consent.
- **Resource** — a file or a folder that the manifest of a Forge app names, and that the deploy bundles.
- **D1** — the first entry in `DECISIONS.md`.
