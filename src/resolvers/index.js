import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { kvs } from '@forge/kvs';
import { chat } from '@forge/llm';
import {
  countKey,
  hasEnough,
  MAX_BRIEFS,
  MAX_COMMENTS,
  MAX_OUTPUT_TOKENS,
  MODEL,
  parseBrief,
  RULES,
  sourceLine,
  ticketText,
} from '../lib/brief';
import { cleanNote, FIELDS, PROPERTY_KEY } from '../lib/note';
import { MAX_CHECKED, riskRows } from '../lib/risk';
import { sign } from '../lib/signature';

// Reads the dogear of a ticket. A ticket with no property has no note.
// Anyone who can edit the ticket can write the property through Jira's API, so the
// texts go through cleanNote here too, and the panel always gets four strings.
const readNote = async (issueKey) => {
  const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/properties/${PROPERTY_KEY}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the note read`);
  const value = (await response.json()).value;
  const texts = cleanNote(value);
  return texts && { ...value, ...texts };
};

const canEdit = async (issueKey) => {
  const response = await api
    .asUser()
    .requestJira(route`/rest/api/3/mypermissions?issueKey=${issueKey}&permissions=EDIT_ISSUES`);
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the permission check`);
  return (await response.json()).permissions?.EDIT_ISSUES?.havePermission === true;
};

export const displayName = async (accountId) => {
  const response = await api.asUser().requestJira(route`/rest/api/3/user?accountId=${accountId}`);
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the user read`);
  return (await response.json()).displayName;
};

// The ticket always comes from the Forge context, never from the browser.
const issueKeyOf = (context) => context.extension.issue.key;

// The project page gets its project from the Forge context too. The browser sends no input.
const projectKeyOf = (context) => context.extension.project.key;

export const getNote = async ({ context }) => {
  const issueKey = issueKeyOf(context);
  const [note, edit] = await Promise.all([readNote(issueKey), canEdit(issueKey)]);
  return {
    note,
    savedByName: note ? await displayName(note.savedBy) : null,
    canEdit: edit,
    now: new Date().toISOString(),
  };
};

// The browser sends only the four texts. The author and the time are stamped here.
export const saveNote = async ({ payload, context }) => {
  const issueKey = issueKeyOf(context);
  const texts = cleanNote(payload);
  if (!texts) throw new Error('A dogear needs text in one or more fields');
  if (!(await canEdit(issueKey))) throw new Error('No permission to edit this ticket');
  // Read the name before the write, so an error after this point never hides a saved note.
  const savedByName = await displayName(context.accountId);

  const note = { v: 1, ...texts, savedBy: context.accountId, savedAt: new Date().toISOString() };
  note.sig = sign(issueKey, note, process.env.NOTE_SIGNING_KEY);
  const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/properties/${PROPERTY_KEY}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the note save`);
  console.log(`dogear saved issue=${issueKey}`);

  return { note, savedByName, canEdit: true, now: note.savedAt };
};

const searchJira = async (searchRoute, body) => {
  const response = await api.asUser().requestJira(searchRoute, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the search`);
  return response.json();
};

// The at-risk list of the project page. One search as the person returns the most recently
// updated in-progress tickets with their notes (D18). Jira leaves out each ticket that the
// person cannot view. The note texts stay on the server: the page gets only the rows.
export const getAtRisk = async ({ context }) => {
  const projectKey = projectKeyOf(context);
  const jql = `project = "${projectKey}" AND statusCategory = "In Progress" ORDER BY updated DESC`;
  const { issues, isLast } = await searchJira(route`/rest/api/3/search/jql`, {
    jql,
    maxResults: MAX_CHECKED,
    fields: ['summary', 'assignee', 'updated'],
    properties: [PROPERTY_KEY],
  });
  // The search gives no total. Jira's count is approximate, so it never goes below the
  // number of tickets checked.
  const inProgress = isLast
    ? issues.length
    : Math.max(issues.length, (await searchJira(route`/rest/api/3/search/approximate-count`, { jql })).count);
  const rows = riskRows(issues, process.env.NOTE_SIGNING_KEY);
  console.log(`at-risk list project=${projectKey} checked=${issues.length} atRisk=${rows.length}`);
  return { rows, checked: issues.length, inProgress, now: new Date().toISOString() };
};

const readJson = async (response, what) => {
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the ${what} read`);
  return response.json();
};

// The parts of a ticket that the brief reads, as the person (D26: v2 gives plain text).
const readTicket = async (issueKey) => {
  const user = api.asUser();
  const [issue, comments, webLinks] = await Promise.all([
    user
      .requestJira(route`/rest/api/2/issue/${issueKey}?fields=summary,status,assignee,description,issuelinks&expand=changelog`)
      .then((response) => readJson(response, 'ticket')),
    user
      .requestJira(route`/rest/api/2/issue/${issueKey}/comment?orderBy=-created&maxResults=${MAX_COMMENTS}`)
      .then((response) => readJson(response, 'comment')),
    user.requestJira(route`/rest/api/3/issue/${issueKey}/remotelink`).then((response) => readJson(response, 'link')),
  ]);
  return { issue, comments: comments.comments, webLinks };
};

// The pick-up brief of a ticket with no dogear. The app keeps no brief (D23). Only a
// brief that the model wrote adds 1 to the site's count for the day (D25, D27).
export const getBrief = async ({ context }) => {
  const issueKey = issueKeyOf(context);
  const { issue, comments, webLinks } = await readTicket(issueKey);
  if (!hasEnough(issue, comments, webLinks)) return { status: 'tooLittle' };

  const now = new Date().toISOString();
  const key = countKey(now);
  const count = (await kvs.get(key)) ?? 0;
  if (count >= MAX_BRIEFS) return { status: 'limit' };

  const { text, counts, newestCommentAt } = ticketText(issue, comments, webLinks);
  const started = Date.now();
  const response = await chat({
    model: MODEL,
    max_completion_tokens: MAX_OUTPUT_TOKENS,
    messages: [
      { role: 'system', content: RULES },
      { role: 'user', content: text },
    ],
  });
  const brief = parseBrief(response.choices?.[0]?.message?.content);
  if (!brief) throw new Error('The model did not answer with a brief');
  if (FIELDS.every((field) => brief[field] === null)) return { status: 'tooLittle' };

  await kvs.set(key, count + 1);
  const { input_tokens: tokensIn, output_tokens: tokensOut } = response.usage ?? {};
  console.log(
    `brief built issue=${issueKey} ms=${Date.now() - started} in=${tokensIn} out=${tokensOut} count=${count + 1}`
  );
  return { status: 'brief', brief, sourceLine: sourceLine(counts, newestCommentAt, now) };
};

const resolver = new Resolver();
resolver.define('getNote', getNote);
resolver.define('saveNote', saveNote);
resolver.define('getAtRisk', getAtRisk);
resolver.define('getBrief', getBrief);

export const handler = resolver.getDefinitions();
