// The Jira issue property that holds the stand note of a ticket.
export const PROPERTY_KEY = 'stand-note';

export const FIELDS = ['done', 'next', 'watchOut', 'code'];

export const LABELS = { done: 'Done', next: 'Next', watchOut: 'Watch out', code: 'Code' };

export const MAX_LENGTH = 1000;

// Turns the texts from the browser into a note: each field trimmed and capped.
// Returns null when all four fields are empty.
export const cleanNote = (input) => {
  const note = {};
  for (const field of FIELDS) {
    const value = input?.[field];
    note[field] = typeof value === 'string' ? value.trim().slice(0, MAX_LENGTH) : '';
  }
  return FIELDS.some((field) => note[field] !== '') ? note : null;
};

// The fields whose text is longer than MAX_LENGTH after a trim, each with its label and
// length. The agent's save refuses these, so that no text is cut in silence.
export const tooLong = (input) =>
  FIELDS.filter((field) => typeof input?.[field] === 'string' && input[field].trim().length > MAX_LENGTH).map(
    (field) => ({ label: LABELS[field], length: input[field].trim().length })
  );
