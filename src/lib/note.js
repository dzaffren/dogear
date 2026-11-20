// The Jira issue property that holds the stand note of a ticket.
export const PROPERTY_KEY = 'stand-note';

export const FIELDS = ['done', 'next', 'watchOut', 'code'];

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
