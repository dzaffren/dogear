import { describe, expect, it } from 'vitest';
import { currentLine } from '../src/lib/summary';

describe('currentLine', () => {
  it('says each in-progress ticket has a current note', () => {
    expect(currentLine(3, 3)).toBe('Each of the 3 in-progress tickets has a current stand note.');
    expect(currentLine(1, 1)).toBe('The 1 in-progress ticket has a current stand note.');
  });

  it('says that it checked only the most recently updated, when the project has more', () => {
    expect(currentLine(100, 240)).toBe(
      'Each of the 100 most recently updated of about 240 in-progress tickets has a current stand note.'
    );
  });
});
