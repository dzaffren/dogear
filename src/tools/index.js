import api, { route } from '@forge/api';
import { savedLine } from '../lib/age';
import { cleanNote, FIELDS, LABELS, MAX_LENGTH, PROPERTY_KEY, tooLong } from '../lib/note';
import { displayName } from '../resolvers';

const SAVE_FAILED = 'Jira did not answer the save. The note was not saved. Try again.';
const READ_FAILED = 'Jira did not answer the read. Try again.';

const noTicket = (issueKey) => `Jira has no ticket ${issueKey} that you can see.`;

const count = (n) => n.toLocaleString('en-US');

// The read tool of the agent. One Jira call tells "no note" from "no such ticket".
export const getStandNote = async (payload) => {
  const { issueKey } = payload;
  try {
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/3/issue/${issueKey}?fields=summary&properties=${PROPERTY_KEY}`);
    if (response.status === 404) return noTicket(issueKey);
    if (!response.ok) return READ_FAILED;
    const issue = await response.json();
    const value = issue.properties?.[PROPERTY_KEY];
    const texts = cleanNote(value);
    if (!texts) return `${issue.key} has no stand note.`;
    const name = await displayName(value.savedBy);
    return [
      `Stand note on ${issue.key}`,
      savedLine(value, name, new Date().toISOString()),
      ...FIELDS.filter((field) => texts[field]).map((field) => `${LABELS[field]}: ${texts[field]}`),
    ].join('\n');
  } catch (error) {
    console.log(`stand-note read failed issue=${issueKey}: ${error.message}`);
    return READ_FAILED;
  }
};

// The save tool of the agent. It answers with one text and never throws, because only a
// returned text reaches the agent. The author comes from Forge, never from the agent.
export const saveStandNote = async (payload, context) => {
  const { issueKey } = payload;
  const long = tooLong(payload);
  if (long.length > 0) {
    return long
      .map(({ label, length }) => `${label} has ${count(length)} characters. The limit is ${count(MAX_LENGTH)}.`)
      .join(' ');
  }
  const texts = cleanNote(payload);
  if (!texts) return 'A stand note needs text in Done, Next, Watch out or Code.';
  try {
    const permission = await api
      .asUser()
      .requestJira(route`/rest/api/3/mypermissions?issueKey=${issueKey}&permissions=EDIT_ISSUES`);
    if (permission.status === 404) return noTicket(issueKey);
    if (!permission.ok) return SAVE_FAILED;
    if ((await permission.json()).permissions?.EDIT_ISSUES?.havePermission !== true) {
      return `You cannot edit ${issueKey}, so the note was not saved.`;
    }
    const note = { v: 1, ...texts, savedBy: context.principal.accountId, savedAt: new Date().toISOString(), via: 'agent' };
    const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/properties/${PROPERTY_KEY}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!response.ok) return SAVE_FAILED;
    console.log(`stand-note saved issue=${issueKey} via=agent`);
    return `Saved the stand note on ${issueKey}.`;
  } catch (error) {
    console.log(`stand-note save failed issue=${issueKey}: ${error.message}`);
    return SAVE_FAILED;
  }
};
