---
name: dogear
description: Keeps the dogear of a Jira ticket current while you work on it. A dogear is a short note with Done, Next, Watch out and Code, kept by the Dogear app for Jira. Use it when work starts on a ticket, after each finished step, and before you stop.
---

# Dogear

Each Jira ticket has a dogear: a short note with Done, Next, Watch out, Code. Keep it
current with the two tools of the `dogear` MCP server: `get-dogear` reads it, and
`save-dogear` saves it.

- Take the ticket key from the branch name: `feat/pay-142-refund` is PAY-142. If the
  branch has no key, ask me.
- When you start work on a ticket, read its dogear first. Carry on from Next, and
  obey Watch out.
- Save the dogear after each finished step, and before you stop.
- Read the dogear before each save. A save replaces the whole dogear, so send each
  field that is still true.
- Write for a teammate who did not see this session. Keep each field under 1,000
  characters.
