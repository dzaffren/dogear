# Forge issue context: what the site really does

**Date:** 2026-11-21 · **From:** /build stand-note

- Jira calls a `jira:issueContext` `dynamicProperties` function on expand and on
  collapse, but the issue view on `dzaffren.atlassian.net` shows no `status` lozenge,
  also not the static one in the manifest. Do not plan a feature on that lozenge.
- The local manifest schema in Forge CLI 15.1.0 has no `dynamicProperties` key for this
  module, but `forge lint` and `forge deploy` accept it.
- Jira re-renders the ticket a few seconds after it loads and collapses an issue context
  panel again. An e2e test must expand until the panel content shows, not click once and
  trust `aria-expanded`.
- `forge lint` names the missing scope for each REST route. Run it before a plan fixes
  the scope list.
- A project name that starts with the panel title breaks a `getByRole` name regex,
  because the sidebar lists the project as a button.
- A UI Kit `invoke` goes to `/gateway/api/graphql/pq/...` as `useInvokeExtensionRelayMutation`,
  with the resolver key in the body. `page.route` can refuse one call by that key.
- A `jira:issueContext` page has many buttons named "Edit ..."; use `exact: true`.
