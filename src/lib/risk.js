import { cleanNote, PROPERTY_KEY } from './note';
import { isSigned } from './signature';

// A change in the first hour after a save does not count: an agent often saves the note
// and then moves the ticket (D17).
export const GRACE_MS = 60 * 60 * 1000;

// The list checks the most recently updated in-progress tickets, up to this many.
export const MAX_CHECKED = 100;

// The gap between the last change of a ticket and the save of its note. Null when the
// ticket has no note, or a note with no text or no valid saved time.
const gapOf = (note, updatedMs) => {
  if (!cleanNote(note)) return null;
  const savedMs = typeof note.savedAt === 'string' ? Date.parse(note.savedAt) : NaN;
  return Number.isNaN(savedMs) ? null : updatedMs - savedMs;
};

// Turns the tickets of a Jira search into the rows of the at-risk list: each ticket with no
// note, or with a note more than GRACE_MS behind the ticket's Updated time. Tickets with no
// note come first, oldest change on top. Then the notes that are behind, largest gap on top.
// Server code only: the signature check needs the signing key.
export const riskRows = (issues, signingKey) =>
  issues
    .map((issue) => {
      const note = issue.properties?.[PROPERTY_KEY];
      const updatedMs = Date.parse(issue.fields.updated);
      const gapMs = gapOf(note, updatedMs);
      return {
        key: issue.key,
        summary: issue.fields.summary,
        assignee: issue.fields.assignee?.displayName ?? null,
        updated: new Date(updatedMs).toISOString(),
        gapMs,
        outside: gapMs !== null && !isSigned(issue.key, note, signingKey),
      };
    })
    .filter((row) => row.gapMs === null || row.gapMs > GRACE_MS)
    .sort((a, b) => {
      if ((a.gapMs === null) !== (b.gapMs === null)) return a.gapMs === null ? -1 : 1;
      if (a.gapMs === null) return Date.parse(a.updated) - Date.parse(b.updated);
      return b.gapMs - a.gapMs;
    });
