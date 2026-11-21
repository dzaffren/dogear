// The line under "No ticket is at risk". When the project has more in-progress tickets than
// the list checked, it says that it checked only the most recently updated.
export const currentLine = (checked, inProgress) => {
  if (inProgress > checked) {
    return `Each of the ${checked} most recently updated of about ${inProgress} in-progress tickets has a current stand note.`;
  }
  if (checked === 1) return 'The 1 in-progress ticket has a current stand note.';
  return `Each of the ${checked} in-progress tickets has a current stand note.`;
};
