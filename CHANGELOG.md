# Changelog

All notable changes to this project are documented in this file. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Keep a short stand note on each Jira ticket: what is done, what is next, what to watch out for, and the branch or link.
- Anyone who can view the ticket reads the note with its author and age; anyone who can edit the ticket can change it.
- A coding agent such as Claude Code reads and saves the stand note of a ticket through two MCP tools, and the panel says when an agent saved the note.
- An agent gets a plain refusal that says what to fix: a field over 1,000 characters, a ticket the person cannot edit, or access not yet allowed in the panel.
- A lead opens Stand notes in a Jira project and sees each in-progress ticket that has no stand note, or a note saved more than 1 hour before the ticket last changed.
- The at-risk list puts the tickets with no note first, then says how far each other note is behind, such as "Note is 2 days behind".
- On a ticket with no stand note, a person selects "Build a brief from Jira" and gets a brief that AI builds from the description, comments, history and links, with "Not known" where Jira does not say.
- A person who can edit the ticket turns the brief into the stand note through the note form, and checks each field before the save.
- The app has a name, Dogear, and a logo. The note on each ticket is now a dogear, and the project tab is Dogears.
- Install Dogear on any Jira site from its installation link, and try it in two minutes with the guide, `GUIDE.md`.
- The Dogear panel and the Dogears tab show the Dogear icon.
- Give a coding agent the rules for the dogear with one skill file, `skills/dogear/SKILL.md`.
- Ask a coding agent which tickets of a project need a dogear: it lists them, asks which one to start, and carries on from that ticket's dogear.

### Changed

- BREAKING: The MCP tools are now `get-dogear` and `save-dogear`; change `get-stand-note` and `save-stand-note` in the rule text of your agent.

### Security

- An agent no longer gets a teammate's name on a stand note that someone wrote outside Stand Note; such a note now reads "Saved outside Stand Note".
- The panel no longer names a teammate as the author of a dogear that someone wrote outside Dogear; such a dogear now reads "Saved outside Dogear".
- The skill file no longer tells an agent to obey Watch out; the agent treats a dogear as notes and asks before it runs a command that a dogear names.
