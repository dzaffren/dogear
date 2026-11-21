import { createHmac, timingSafeEqual } from 'node:crypto';
import { FIELDS } from './note';

// Anyone who can edit a ticket can write the stand-note property through Jira's API, with
// any savedBy. The app signs each note it saves, so a read can tell a note that Stand Note
// saved from one written another way. The key is the Forge variable NOTE_SIGNING_KEY.
// Server code only: the panel bundle cannot load node:crypto.

const signed = (issueKey, note) =>
  JSON.stringify([issueKey.toUpperCase(), ...FIELDS.map((field) => note[field]), note.savedBy, note.savedAt, note.via ?? null]);

export const sign = (issueKey, note, key) => createHmac('sha256', key).update(signed(issueKey, note)).digest('base64url');

export const isSigned = (issueKey, note, key) => {
  if (typeof note?.sig !== 'string') return false;
  const expected = Buffer.from(sign(issueKey, note, key));
  const given = Buffer.from(note.sig);
  return given.length === expected.length && timingSafeEqual(given, expected);
};
