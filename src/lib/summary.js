import { behindLabel } from './age';

// The agent's list shows this many tickets at most, and counts the rest.
export const MAX_LISTED = 10;

// The line under "No ticket is at risk". When the project has more in-progress tickets than
// the list checked, it says that it checked only the most recently updated.
export const currentLine = (checked, inProgress) => {
  if (inProgress > checked) {
    return `Each of the ${checked} most recently updated of about ${inProgress} in-progress tickets has a current dogear.`;
  }
  if (checked === 1) return 'The 1 in-progress ticket has a current dogear.';
  return `Each of the ${checked} in-progress tickets has a current dogear.`;
};

const checkedLine = (projectKey, checked, inProgress) => {
  if (inProgress > checked) {
    return `Checked the ${checked} most recently updated of about ${inProgress} in-progress tickets in ${projectKey}.`;
  }
  return `Checked ${checked} in-progress ticket${checked === 1 ? '' : 's'} in ${projectKey}.`;
};

const listLine = (row) => {
  const state = row.gapMs === null ? 'No dogear' : behindLabel(row.gapMs);
  const outside = row.outside ? ', saved outside Dogear' : '';
  return `- ${row.key} · ${row.summary} · ${row.assignee ?? 'Unassigned'} · ${state}${outside}`;
};

// The answer of the agent's at-risk list, in the words and the order of the Dogears tab.
// It has no note texts (D40): the agent reads the dogear of the ticket that the person picks.
export const atRiskText = (projectKey, { rows, checked, inProgress }) => {
  if (checked === 0) {
    return `No ticket in ${projectKey} is in progress. The list checks the tickets whose status is in progress.`;
  }
  const checkedText = checkedLine(projectKey, checked, inProgress);
  if (rows.length === 0) return `No in-progress ticket in ${projectKey} needs a dogear. ${checkedText}`;
  const more = rows.length - MAX_LISTED;
  return [
    `Tickets in ${projectKey} that need a dogear:`,
    ...rows.slice(0, MAX_LISTED).map(listLine),
    ...(more > 0 ? [`${more} more need a dogear. Open the Dogears tab of ${projectKey} to see them all.`] : []),
    checkedText,
  ].join('\n');
};
