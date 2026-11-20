import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { cleanNote, PROPERTY_KEY } from '../lib/note';

// Reads the stand note of a ticket. A ticket with no property has no note.
// `requester` is api.asUser() or api.asApp().
export const readNote = async (requester, issueKey) => {
  const response = await requester.requestJira(route`/rest/api/3/issue/${issueKey}/properties/${PROPERTY_KEY}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the note read`);
  return (await response.json()).value;
};

const canEdit = async (issueKey) => {
  const response = await api
    .asUser()
    .requestJira(route`/rest/api/3/mypermissions?issueKey=${issueKey}&permissions=EDIT_ISSUES`);
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the permission check`);
  return (await response.json()).permissions?.EDIT_ISSUES?.havePermission === true;
};

const displayName = async (accountId) => {
  const response = await api.asUser().requestJira(route`/rest/api/3/user?accountId=${accountId}`);
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the user read`);
  return (await response.json()).displayName;
};

// The ticket always comes from the Forge context, never from the browser.
const issueKeyOf = (context) => context.extension.issue.key;

export const getNote = async ({ context }) => {
  const issueKey = issueKeyOf(context);
  const [note, edit] = await Promise.all([readNote(api.asUser(), issueKey), canEdit(issueKey)]);
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
  if (!texts) throw new Error('A stand note needs text in one or more fields');
  if (!(await canEdit(issueKey))) throw new Error('No permission to edit this ticket');

  const note = { v: 1, ...texts, savedBy: context.accountId, savedAt: new Date().toISOString() };
  const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/properties/${PROPERTY_KEY}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error(`Jira answered ${response.status} to the note save`);
  console.log(`stand-note saved issue=${issueKey}`);

  return { note, savedByName: await displayName(context.accountId), canEdit: true, now: note.savedAt };
};

const resolver = new Resolver();
resolver.define('getNote', getNote);
resolver.define('saveNote', saveNote);

export const handler = resolver.getDefinitions();
