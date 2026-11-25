import { describe, expect, it } from 'vitest';
import { atRiskText, currentLine } from '../src/lib/summary';

describe('currentLine', () => {
  it('says each in-progress ticket has a current note', () => {
    expect(currentLine(3, 3)).toBe('Each of the 3 in-progress tickets has a current dogear.');
    expect(currentLine(1, 1)).toBe('The 1 in-progress ticket has a current dogear.');
  });

  it('says that it checked only the most recently updated, when the project has more', () => {
    expect(currentLine(100, 240)).toBe(
      'Each of the 100 most recently updated of about 240 in-progress tickets has a current dogear.'
    );
  });
});

const HOUR = 60 * 60 * 1000;
const row = (key, summary, assignee, gapMs, outside = false) => ({
  key,
  summary,
  assignee,
  updated: '2026-11-26T01:00:00.000Z',
  gapMs,
  outside,
});

describe('atRiskText', () => {
  it('lists each ticket with its summary, assignee and how far behind, then what it checked', () => {
    const rows = [
      row('PAY-150', 'Add partial refunds', 'Hafiz Omar', null),
      row('PAY-142', 'Add refund endpoint', 'Aisyah Rahman', 48 * HOUR),
      row('PAY-175', 'Add refund report', null, 5 * HOUR, true),
    ];
    expect(atRiskText('PAY', { rows, checked: 4, inProgress: 4 })).toBe(
      [
        'Tickets in PAY that need a dogear:',
        '- PAY-150 · Add partial refunds · Hafiz Omar · No dogear',
        '- PAY-142 · Add refund endpoint · Aisyah Rahman · Dogear is 2 days behind',
        '- PAY-175 · Add refund report · Unassigned · Dogear is 5 hours behind, saved outside Dogear',
        'Checked 4 in-progress tickets in PAY.',
      ].join('\n')
    );
  });

  it('lists 10 tickets and counts the rest', () => {
    const rows = Array.from({ length: 14 }, (_, i) => row(`PAY-${200 + i}`, `Refund task ${i + 1}`, 'Hafiz Omar', null));
    const lines = atRiskText('PAY', { rows, checked: 20, inProgress: 20 }).split('\n');
    expect(lines.filter((line) => line.startsWith('- '))).toHaveLength(10);
    expect(lines[10]).toBe('- PAY-209 · Refund task 10 · Hafiz Omar · No dogear');
    expect(lines[11]).toBe('4 more need a dogear. Open the Dogears tab of PAY to see them all.');
    expect(lines[12]).toBe('Checked 20 in-progress tickets in PAY.');
  });

  it('says that it checked only the most recently updated, when the project has more', () => {
    const rows = [row('PAY-150', 'Add partial refunds', 'Hafiz Omar', null)];
    expect(atRiskText('PAY', { rows, checked: 100, inProgress: 240 }).split('\n').at(-1)).toBe(
      'Checked the 100 most recently updated of about 240 in-progress tickets in PAY.'
    );
  });

  it('says when no ticket needs a dogear', () => {
    expect(atRiskText('PAY', { rows: [], checked: 3, inProgress: 3 })).toBe(
      'No in-progress ticket in PAY needs a dogear. Checked 3 in-progress tickets in PAY.'
    );
    expect(atRiskText('PAY', { rows: [], checked: 1, inProgress: 1 })).toBe(
      'No in-progress ticket in PAY needs a dogear. Checked 1 in-progress ticket in PAY.'
    );
  });

  it('says when no ticket is in progress', () => {
    expect(atRiskText('PAY', { rows: [], checked: 0, inProgress: 0 })).toBe(
      'No ticket in PAY is in progress. The list checks the tickets whose status is in progress.'
    );
  });
});
