# The dogear signature: every reader checks it

**Date:** 2026-11-24 · **From:** /debug of the panel's "Saved by"

- Three code paths read the `stand-note` property: `getNote` in `src/resolvers/index.js`
  (the panel), `getDogear` in `src/tools/index.js` (the agent) and `riskRows` in
  `src/lib/risk.js` (the Dogears tab). A trust check added to one reader must reach all
  three. The agent's check (07fb814) missed the panel until 712c3e0.
- A test fixture that stores an unsigned note and expects an author's name locks in the
  bug. Sign each fixture that expects a name.
