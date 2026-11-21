import api, { route } from '@forge/api';
import { cleanNote, PROPERTY_KEY } from '../lib/note';

const SAVE_FAILED = 'Jira did not answer the save. The note was not saved. Try again.';

// The save tool of the agent. It answers with one text and never throws, because only a
// returned text reaches the agent. The author comes from Forge, never from the agent.
export const saveStandNote = async (payload, context) => {
  const { issueKey } = payload;
  const texts = cleanNote(payload);
  try {
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
