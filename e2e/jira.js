// Jira API helpers for the e2e tests. They act as the main account, with the token from .env.
export const SITE = 'https://dzaffren.atlassian.net';
export const PROPERTY_KEY = 'stand-note';

export const jira = async (method, path, body) => {
  const token = Buffer.from(`${process.env.FORGE_EMAIL}:${process.env.ATLASSIAN_API_KEY}`).toString('base64');
  const response = await fetch(`${SITE}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${token}`,
      Accept: 'application/json',
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${method} ${path}: Jira answered ${response.status} ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const mainAccountId = async () => (await jira('GET', '/rest/api/3/myself')).accountId;

// Finds the ticket with this summary in the project, or makes it.
export const findOrCreateIssue = async (projectKey, summary) => {
  const jql = encodeURIComponent(`project = ${projectKey} AND summary ~ "${summary}" ORDER BY created ASC`);
  const found = await jira('GET', `/rest/api/3/search/jql?jql=${jql}&fields=summary`);
  const issue = found.issues.find((i) => i.fields.summary === summary);
  if (issue) return issue.key;
  const created = await jira('POST', '/rest/api/3/issue', {
    fields: { project: { key: projectKey }, summary, issuetype: { name: 'Task' } },
  });
  return created.key;
};

// Moves the ticket to the status with this name, through the transition that leads there.
export const moveTo = async (issueKey, statusName) => {
  const issue = await jira('GET', `/rest/api/3/issue/${issueKey}?fields=status`);
  if (issue.fields.status.name === statusName) return;
  const { transitions } = await jira('GET', `/rest/api/3/issue/${issueKey}/transitions`);
  const transition = transitions.find((t) => t.to.name === statusName);
  if (!transition) throw new Error(`${issueKey} has no transition to ${statusName}`);
  await jira('POST', `/rest/api/3/issue/${issueKey}/transitions`, { transition: { id: transition.id } });
};

// Changes the description, so that Jira's Updated time of the ticket is now.
export const touch = (issueKey) =>
  jira('PUT', `/rest/api/3/issue/${issueKey}`, {
    fields: {
      description: {
        type: 'doc',
        version: 1,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: `Touched by the e2e test at ${new Date().toISOString()}` }] }],
      },
    },
  });

const propertyPath = (issueKey) => `/rest/api/3/issue/${issueKey}/properties/${PROPERTY_KEY}`;

export const getNote = async (issueKey) => (await jira('GET', propertyPath(issueKey)))?.value ?? null;

export const setNote = (issueKey, note) => jira('PUT', propertyPath(issueKey), note);

export const deleteNote = (issueKey) => jira('DELETE', propertyPath(issueKey));
