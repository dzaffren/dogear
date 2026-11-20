import api from '@forge/api';
import { ageLabel } from './lib/age';
import { readNote } from './resolvers';

// Jira calls this for the tag on the collapsed Stand note header.
export const tag = async (payload) => {
  const note = await readNote(api.asApp(), payload.extension.issue.key);
  const value = note
    ? { label: ageLabel(note.savedAt, new Date().toISOString()), type: 'inprogress' }
    : { label: 'No note', type: 'default' };
  return { status: { type: 'lozenge', value } };
};
