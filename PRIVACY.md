# Dogear privacy policy

**Updated:** 2026-11-24

Dogear is a Forge app for Jira. It runs on Atlassian's Forge platform, and it keeps its
data on the Jira site where it is installed. It sends no data to a server outside
Atlassian.

## What Dogear stores

| What | Where | For how long |
| ---- | ----- | ------------ |
| Each dogear: the texts Done, Next, Watch out and Code, the account ID of the person who saved it, the time of the save, whether an agent saved it, and a signature | A Jira issue property named `stand-note` on that ticket | Until a person saves a new dogear on the ticket, or the ticket is deleted |
| The number of pick-up briefs that the site built on one day | The app's key-value store on Forge | One number for each day, not deleted. It holds no name, no ticket and no text |

Dogear shows a person's name next to a dogear. It reads the name from Jira each time, and
it does not store it.

## What Dogear reads

Dogear reads Jira as the person who uses it, with that person's permissions: a ticket's
fields, comments, links and history, and the issues of a project. It reads only when a
person opens the panel or the Dogears tab, or when that person's coding agent calls a tool.

## The pick-up brief

When a person selects "Build a brief from Jira", Dogear sends the text of that ticket to
Forge LLM, the AI service that Atlassian runs for Forge apps. Dogear shows the brief and
does not keep it. A brief becomes a dogear only when the person saves it.

## Coding agents

A coding agent reaches Dogear through Atlassian's MCP server, after the person signs in
there. The agent's calls act as that person. Dogear stores what the agent saves as a
dogear, as above, and marks that an agent saved it.

## Logs

Forge keeps the app's logs for the developer. A log line names the ticket key and what
happened, such as "dogear saved". It holds no text of a dogear and no name.

## Questions

Open an issue at https://github.com/dzaffren/dogear/issues.
