import api, { NeedsAuthenticationError, route } from '@forge/api';
import { savedLine } from '../lib/age';
import { cleanNote, FIELDS, LABELS, MAX_LENGTH, PROPERTY_KEY, tooLong } from '../lib/note';
import { isSigned, sign } from '../lib/signature';
import { displayName } from '../resolvers';

const SAVE_FAILED = 'Jira did not answer the save. The dogear was not saved. Try again.';
const READ_FAILED = 'Jira did not answer the read. Try again.';

const noTicket = (issueKey) => `Jira has no ticket ${issueKey} that you can see.`;

const count = (n) => n.toLocaleString('en-US');

// Forge throws NeedsAuthenticationError on a call as the person until the person selects
// Allow access in a panel of this app. The MCP sign-in does not count as that consent.
const allowAccess = (verb) => `Open the Dogear panel on a Jira ticket once and select Allow access. Then ${verb} again.`;

// The read tool of the agent. One Jira call tells "no note" from "no such ticket".
export const getDogear = async (payload) => {
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
    if (!texts) return `${issue.key} has no dogear.`;
    // Name the author only when Dogear signed the note. Anyone who can edit the ticket
    // can write the property through Jira's API, with any savedBy.
    const name = isSigned(issue.key, value, process.env.NOTE_SIGNING_KEY) ? await displayName(value.savedBy) : null;
    return [
      `Dogear on ${issue.key}`,
      savedLine(value, name, new Date().toISOString()),
      ...FIELDS.filter((field) => texts[field]).map((field) => `${LABELS[field]}: ${texts[field]}`),
    ].join('\n');
  } catch (error) {
    if (error instanceof NeedsAuthenticationError) return allowAccess('read');
    console.log(`dogear read failed issue=${issueKey}: ${error.message}`);
    return READ_FAILED;
  }
};

// The save tool of the agent. It answers with one text and never throws, because only a
// returned text reaches the agent. The author comes from Forge, never from the agent.
export const saveDogear = async (payload, context) => {
  const { issueKey } = payload;
  const long = tooLong(payload);
  if (long.length > 0) {
    return long
      .map(({ label, length }) => `${label} has ${count(length)} characters. The limit is ${count(MAX_LENGTH)}.`)
      .join(' ');
  }
  const texts = cleanNote(payload);
  if (!texts) return 'A dogear needs text in Done, Next, Watch out or Code.';
  try {
    const permission = await api
      .asUser()
      .requestJira(route`/rest/api/3/mypermissions?issueKey=${issueKey}&permissions=EDIT_ISSUES`);
    if (permission.status === 404) return noTicket(issueKey);
    if (!permission.ok) return SAVE_FAILED;
    if ((await permission.json()).permissions?.EDIT_ISSUES?.havePermission !== true) {
      return `You cannot edit ${issueKey}, so the dogear was not saved.`;
    }
    const note = { v: 1, ...texts, savedBy: context.principal.accountId, savedAt: new Date().toISOString(), via: 'agent' };
    note.sig = sign(issueKey, note, process.env.NOTE_SIGNING_KEY);
    const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/properties/${PROPERTY_KEY}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!response.ok) return SAVE_FAILED;
    console.log(`dogear saved issue=${issueKey} via=agent`);
    return `Saved the dogear on ${issueKey}.`;
  } catch (error) {
    if (error instanceof NeedsAuthenticationError) return allowAccess('save');
    console.log(`dogear save failed issue=${issueKey}: ${error.message}`);
    return SAVE_FAILED;
  }
};
