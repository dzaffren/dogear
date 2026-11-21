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

### Security

- An agent no longer gets a teammate's name on a stand note that someone wrote outside Stand Note; such a note now reads "Saved outside Stand Note".
