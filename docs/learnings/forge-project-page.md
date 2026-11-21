# Forge project page: what the site really does

**Date:** 2026-11-21 · **From:** /build at-risk-list

- A `jira:projectPage` tab sits under More in the project's row of tabs until a person
  opens it once. After that visit Jira shows it in the row, with a `Dev` tag in the
  development environment.
- Its URL is `/jira/software/projects/<KEY>/apps/<appId>/<envId>`, with no `/c/` for a
  company-managed project. The env ID comes from `forge environments list`.
- The resolver of a project page gets the project in `context.extension.project.key`.
- In UI Kit, a `Lozenge` and a `Link` render inside a `DynamicTable` cell. A `Link` with a
  relative `/browse/KEY` opens the ticket in the same tab.
- `POST /rest/api/3/search/jql` with `properties: ["stand-note"]` returns each ticket's
  property in `issue.properties`. The answer has `issues` and `isLast`, and no total.
  `POST /rest/api/3/search/approximate-count` gives `{ count }`.
- A PUT of an issue property does not change the ticket's Updated time.
- The `route` tag of `@forge/api` encodes each value. Pass a whole path as a literal
  route, never as `route\`${path}\``.
- The zuko commit guard refuses `git commit -F -`. Use `-m`.
