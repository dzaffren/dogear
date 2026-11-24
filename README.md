# Dogear

![Dogear](docs/design/logo/kit/png/dogear-logo-horizontal-1200.png)

Mark where you stopped.

Judges of Codegeist 2026: start with the [guide](GUIDE.md).

<!-- zuko:start — generated from OVERVIEW.md; edit that file, not this block -->

## What it does

Dogear is a Forge app for Jira. It keeps a dogear on each ticket: a short, current note of
where the work stands. A teammate who picks up the ticket carries on from it. An entry for
Codegeist 2026, which closes on 2026-12-22 at 12:00 Pacific Time.

## Install and run

| Task    | Command                                       |
| ------- | --------------------------------------------- |
| install | `npm install`                                 |
| run     | `npm run deploy`                              |
| test    | `npm test`, then `npm run e2e` after a deploy |
| lint    | `npm run lint`                                |

## Features

- A person saves a dogear on a Jira ticket, a short note that says where the work stands, and anyone who opens the ticket reads it.
- A coding agent such as Claude Code saves the dogear on a Jira ticket as it works, and a second agent reads it and carries on.
- A lead opens one page in a Jira project and sees each in-progress ticket that has no dogear, or a dogear that is behind the last work.
- A person opens a ticket with no dogear, selects one button, and gets a brief that AI builds from what Jira has.
- The app and its note get one name, Dogear, with a logo and one brand kit for the guide, the Devpost entry and the video.
- A Codegeist judge installs Dogear from a link, follows a guide, and sees it work in two minutes.

## Docs

- [Overview](OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Decisions](DECISIONS.md)
- [Changelog](CHANGELOG.md)

<!-- zuko:end -->

## The at-risk list

Each Jira project gets a tab named Dogears. Jira may put it under More in the row of
tabs. It lists the in-progress tickets of the project that have no dogear, or a dogear
saved more than 1 hour before the last change of the ticket. Run `npm run e2e:setup` once
to make the project `SNR`, which the e2e test of this list uses.

## Connect a coding agent

A coding agent, such as Claude Code, reads and saves the dogear through two MCP
tools: `get-dogear` and `save-dogear`. Part 3 of the [guide](GUIDE.md) connects one. The
rules for the agent are in the skill file, [skills/dogear/SKILL.md](skills/dogear/SKILL.md).

In the development environment, each tool name ends in `_development`.

### e2e tests for the agent tools

`npm run e2e` also calls the tools through the MCP server, as the main account. Do two
things as the main account first, on the development install that `npm run deploy` makes.
Open the Dogear panel on a Jira ticket once, and select Allow access. Then turn on its tools,
as in step 1 of part 3 of the guide. The tests sign notes with `NOTE_SIGNING_KEY` from
`.env`, which must be the same value as the Forge variable of that name:
`bash scripts/forge.sh variables set --encrypt -e development NOTE_SIGNING_KEY <value>`. Then run `npm run e2e:mcp-login` once, open the link
that it prints, and sign in as the main account. It saves the login in
`e2e/.auth/mcp.json`, which git ignores.

## Production

`npm run deploy:prod` deploys to the production environment, which the judges install.
Production has its own `NOTE_SIGNING_KEY`, set once on 2026-11-23. Do not set it again:
each dogear saved before the change would lose the name of its author. Do not install
production on `dzaffren.atlassian.net`: the e2e tests would see two Dogear panels.
