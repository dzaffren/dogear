# Forge LLM: what the site really does

**Date:** 2026-11-23 · **From:** /poc and /build pick-up-brief

- `chat` from `@forge/llm` 1.0.10 returns `choices[0].message.content` as a list of parts,
  `[{ type: 'text', text }]`, not a string. Join the text parts before you read them.
- Claude Haiku wrapped a JSON answer in a code fence, also when the rules said "no other
  text". Read from the first `{` to the last `}`.
- `usage` has `input_tokens` and `output_tokens`. A ticket of 8,349 input tokens took 2.3
  to 2.7 seconds, so a UI Kit resolver stays far inside its 25 seconds.
- A wrong model ID throws `ForgeLlmAPIError` with `code: 'FORGE_LLMS_MODEL_NOT_FOUND'` and
  `status: 404`.
- `@forge/llm` and `@forge/kvs` throw "Forge runtime not found" when they load outside
  Forge. Each test file that loads the resolver needs a `vi.mock` for both.
- The `llm` module and the `storage:app` scope make a major version. `forge deploy` stops
  until it gets `--approve MAJOR_VERSION_RULE`, and the site then needs
  `forge install --upgrade`.
- `forge eligibility` keeps Runs on Atlassian with the `llm` module. A `webtrigger` module
  loses it.
- No billing step was needed on the developer account for calls in development.
- A Playwright `route.fulfill` of a UI Kit `invoke` works with the body
  `{ data: { invokeExtension: { success: true, response: { body }, errors: null } } }`. The
  gateway's `contextToken` is not needed.
- Playwright's `getByText('Brief from Jira')` also matches the button "Build a brief from
  Jira": the match ignores case and takes part of a text. Wait on a text that only the new
  view has.
