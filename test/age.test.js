import { describe, expect, it } from 'vitest';
import { ageLabel, behindLabel, savedLine } from '../src/lib/age';

const now = '2026-11-26T01:15:00.000Z';
const before = (ms) => new Date(Date.parse(now) - ms).toISOString();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;

describe('ageLabel', () => {
  it('says Just now under 1 minute', () => {
    expect(ageLabel(before(59 * 1000), now)).toBe('Just now');
    expect(ageLabel(now, now)).toBe('Just now');
  });

  it('says Just now for a time a little ahead of now', () => {
    expect(ageLabel(before(-5 * 1000), now)).toBe('Just now');
  });

  it('counts minutes under 1 hour', () => {
    expect(ageLabel(before(5 * MIN), now)).toBe('5 min ago');
    expect(ageLabel(before(59 * MIN), now)).toBe('59 min ago');
  });

  it('counts hours under 1 day', () => {
    expect(ageLabel(before(HOUR), now)).toBe('1 hour ago');
    expect(ageLabel(before(3 * HOUR + 20 * MIN), now)).toBe('3 hours ago');
  });

  it('counts days after that', () => {
    expect(ageLabel(before(26 * HOUR), now)).toBe('1 day ago');
    expect(ageLabel(before(9 * 24 * HOUR), now)).toBe('9 days ago');
  });

  it('says 2 days ago for a note from 16:40 two days before 09:15', () => {
    // Scenario 2: saved 2026-11-24 16:40, read 2026-11-26 09:15, Malaysia time.
    expect(ageLabel('2026-11-24T08:40:00.000Z', now)).toBe('2 days ago');
  });
});

describe('savedLine', () => {
  const note = { savedAt: '2026-11-24T08:40:00.000Z' };

  it('names the person and the age of a note that a person saved', () => {
    expect(savedLine(note, 'Hafiz Omar', now)).toBe('Saved by Hafiz Omar, 2 days ago');
  });

  it('says through an agent when an agent saved the note', () => {
    expect(savedLine({ ...note, via: 'agent' }, 'Aisyah Rahman', now)).toBe(
      'Saved by Aisyah Rahman through an agent, 2 days ago'
    );
    expect(savedLine({ savedAt: now, via: 'agent' }, 'Aisyah Rahman', now)).toBe(
      'Saved by Aisyah Rahman through an agent, just now'
    );
  });

  it('names no person when the app cannot confirm the author', () => {
    expect(savedLine({ ...note, via: 'agent' }, null, now)).toBe('Saved outside Stand Note, 2 days ago');
  });
});

describe('behindLabel', () => {
  it('says how far the note is behind, in the words of ageLabel', () => {
    expect(behindLabel(61 * MIN)).toBe('Note is 1 hour behind');
    expect(behindLabel(3 * HOUR + 20 * MIN)).toBe('Note is 3 hours behind');
    expect(behindLabel(26 * HOUR)).toBe('Note is 1 day behind');
  });

  it('says 2 days behind for the note of scenario 1, 40 hours and 30 minutes behind', () => {
    expect(behindLabel(40 * HOUR + 30 * MIN)).toBe('Note is 2 days behind');
  });
});
