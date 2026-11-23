# Dogear: a guide for judges

Dogear keeps a short, current note on each Jira ticket: what is done, what is next, what to
watch out for, and where the code is. The note is a dogear. A person or a coding agent keeps
it, so a teammate picks up the ticket and carries on.

This guide takes about ten minutes. Part 2 takes two.

## Before you start

- A Jira site where you are an admin. A free Jira site is enough.
- For part 3 only: Claude Code on your computer.

## 1. Install

1. Open the installation link of Dogear.
2. Pick your Jira site, and select Install. Atlassian says that the app uses AI: the
   pick-up brief uses Forge LLM.
3. Open any ticket. In the right column, open the Dogear panel, and select Allow access.
   The panel says "No dogear yet".

## 2. Try it in two minutes

1. Make a ticket with the summary and the description below. Move it to In Progress.
2. Open the Dogears tab of the project. It lists the ticket with "No dogear". Jira may
   put the tab under More.
3. Open the ticket. In the Dogear panel, select "Build a brief from Jira".
4. Read the brief: Done, Next, Watch out, Code.
5. Select "Use as dogear", then Save. The panel shows "Saved by" your name.
6. Open the Dogears tab again. The ticket is gone from the list.

The ticket's text:

```text
Summary: Refund fails on a partial capture

Description: A refund fails with error 422 when the order was captured in part. Example:
the order is for 100 MYR, the capture is 40 MYR, and a refund of 40 MYR is refused. The
refund check compares the refund with the authorised amount and not with the captured
amount. Done: the failure is reproduced on staging, and `refund.test.js` has a failing
test for it. Next: fix the check in `refundService.js`. Watch out: do not change the path
for a full capture. Branch: `fix/partial-capture-refund`.
```

## 3. Connect a coding agent

A coding agent reads and saves the dogear through two MCP tools, `get-dogear` and
`save-dogear`. The tools act as you, with your Jira permissions. Do the steps in this
order: a sign-in from before step 1 does not show the tools.

1. In Atlassian Administration, go to Apps, Sites, your site, Connected apps. Open
   Dogear, and turn on its tools for MCP-compatible apps.
2. Add the server to Claude Code:

   ```bash
   claude mcp add --transport http dogear https://mcp.atlassian.com/forge/62f3c556-f63e-43bf-9033-8c2d41e14c00
   ```

3. In Claude Code, run `/mcp`, select `dogear`, and sign in with your Atlassian account.
   It lists `get-dogear` and `save-dogear`.
4. Add the skill file, so that Claude Code keeps the dogear by itself. From the folder of a
   code repo:

   ```bash
   mkdir -p .claude/skills/dogear
   curl -fsSL https://raw.githubusercontent.com/dzaffren/dogear/main/skills/dogear/SKILL.md -o .claude/skills/dogear/SKILL.md
   ```

   The file is [skills/dogear/SKILL.md](skills/dogear/SKILL.md).
5. Try two prompts. Use the key of the ticket from part 2, such as KAN-1:

   - "Read the dogear of KAN-1." Claude Code answers with the dogear from part 2.
   - "Save the dogear of KAN-1 with Next: Add a test for a capture of 40 of 100 MYR."
     Open the ticket: the Dogear panel shows that Next, and says that an agent saved it.

### For another agent

Put this block in the `AGENTS.md` of your code repo. It has the rules of the skill file.

```markdown
## Dogear

Each Jira ticket has a dogear: a short note with Done, Next, Watch out, Code. Keep it
current with the `dogear` MCP tools.

- Take the ticket key from the branch name: `feat/pay-142-refund` is PAY-142. If the
  branch has no key, ask me.
- When you start work on a ticket, read its dogear first. Carry on from Next, and
  obey Watch out.
- Save the dogear after each finished step, and before you stop.
- Read the dogear before each save. A save replaces the whole dogear, so send each
  field that is still true.
- Write for a teammate who did not see this session. Keep each field under 1,000
  characters.
```

## If a step fails

| What you see | What to do |
| ------------ | ---------- |
| The agent answers "Open the Dogear panel on a Jira ticket once and select Allow access." | Do step 3 of part 1, then ask again. |
| `/mcp` shows the `dogear` server with no tools. | Turn on the tools in step 1 of part 3. Then, in `/mcp`, select `dogear`, clear the sign-in, and sign in again. |
| The Dogears tab is not in the row of tabs. | Open More in the row of tabs. |
| "Jira has too little on this ticket for a brief." | Paste the whole description from part 2. |
| "This site built its 50 briefs for today. Try again tomorrow." | Each site gets 50 briefs a day. Save a dogear by hand in the panel instead. |
