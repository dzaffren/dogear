const plural = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'}`;

// A length of time as a short text, such as "5 min" or "2 days".
// Days are rounded, so a note from late on Monday is "2 days" old on Wednesday morning.
const span = (ms) => {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return plural(hours, 'hour');
  return plural(Math.round(hours / 24), 'day');
};

// The age of a note as a short label, such as "5 min ago" or "2 days ago".
export const ageLabel = (savedAt, now) => {
  const ms = Date.parse(now) - Date.parse(savedAt);
  if (ms < 60000) return 'Just now';
  return `${span(ms)} ago`;
};

// How far a note is behind the last change of its ticket, such as "Note is 2 days behind".
export const behindLabel = (gapMs) => `Note is ${span(gapMs)} behind`;

// The saved line under a note, such as "Saved by Aisyah Rahman through an agent, 2 days ago".
// The panel and the agent's read tool give the same words. A null name means that the app
// cannot confirm who wrote the note.
export const savedLine = (note, name, now) => {
  const age = ageLabel(note.savedAt, now);
  const when = `${age.charAt(0).toLowerCase()}${age.slice(1)}`;
  if (name === null) return `Saved outside Stand Note, ${when}`;
  const via = note.via === 'agent' ? ' through an agent' : '';
  return `Saved by ${name}${via}, ${when}`;
};
