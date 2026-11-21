import { describe, expect, it } from 'vitest';
import { riskRows } from '../src/lib/risk';
import { sign } from '../src/lib/signature';

const KEY = 'test-signing-key';
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// One ticket as Jira's search returns it, with the stand note in `properties`.
const ticket = (key, summary, assignee, updated, note) => ({
  key,
  fields: { summary, assignee: assignee && { displayName: assignee }, updated },
  properties: note ? { 'stand-note': note } : {},
});

const note = (savedAt, extra = {}) => ({
  v: 1,
  done: 'Endpoint and validation are written',
  next: 'Add the idempotency check',
  watchOut: '',
  code: 'feat/pay-142-refund',
  savedBy: 'acc-aisyah',
  savedAt,
  ...extra,
});

const signed = (issueKey, savedAt) => {
  const value = note(savedAt);
  return { ...value, sig: sign(issueKey, value, KEY) };
};

describe('riskRows', () => {
  // Scenario 1, in Malaysia time (UTC+8).
  const pay142 = ticket('PAY-142', 'Add refund endpoint', 'Aisyah Rahman', '2026-11-26T09:10:00.000+0800', signed('PAY-142', '2026-11-24T08:40:00.000Z'));
  const pay150 = ticket('PAY-150', 'Add partial refunds', 'Hafiz Omar', '2026-11-26T11:00:00.000+0800', null);
  const pay151 = ticket('PAY-151', 'Fix the settlement report', 'Aisyah Rahman', '2026-11-26T10:20:00.000+0800', signed('PAY-151', '2026-11-26T02:00:00.000Z'));

  it('lists a ticket with no note and a ticket whose note is behind, and leaves out a current note', () => {
    expect(riskRows([pay150, pay151, pay142], KEY)).toEqual([
      { key: 'PAY-150', summary: 'Add partial refunds', assignee: 'Hafiz Omar', updated: '2026-11-26T03:00:00.000Z', gapMs: null, outside: false },
      { key: 'PAY-142', summary: 'Add refund endpoint', assignee: 'Aisyah Rahman', updated: '2026-11-26T01:10:00.000Z', gapMs: 40 * HOUR + 30 * 60 * 1000, outside: false },
    ]);
  });

  it('gives no rows when each note is current', () => {
    expect(riskRows([pay151], KEY)).toEqual([]);
    expect(riskRows([], KEY)).toEqual([]);
  });

  it('counts a change of exactly 1 hour after the save as current, and a change after that as behind', () => {
    const at = (gap) =>
      ticket('PAY-160', 'Add refund limits', null, new Date(Date.parse('2026-11-26T02:00:00.000Z') + gap).toISOString(), signed('PAY-160', '2026-11-26T02:00:00.000Z'));
    expect(riskRows([at(HOUR)], KEY)).toEqual([]);
    expect(riskRows([at(HOUR + 1000)], KEY)).toHaveLength(1);
  });

  it('counts a change before the save as current', () => {
    const early = ticket('PAY-161', 'Add refund audit', null, '2026-11-26T01:00:00.000Z', signed('PAY-161', '2026-11-26T02:00:00.000Z'));
    expect(riskRows([early], KEY)).toEqual([]);
  });

  it('puts the tickets with no note first, oldest change on top, then the largest gap on top', () => {
    const rows = riskRows(
      [
        ticket('PAY-170', 'Newer with no note', null, '2026-11-26T05:00:00.000Z', null),
        ticket('PAY-171', 'Small gap', null, '2026-11-26T05:00:00.000Z', signed('PAY-171', '2026-11-26T02:00:00.000Z')),
        ticket('PAY-172', 'Older with no note', null, '2026-11-20T05:00:00.000Z', null),
        ticket('PAY-173', 'Large gap', null, '2026-11-26T05:00:00.000Z', signed('PAY-173', '2026-11-22T02:00:00.000Z')),
      ],
      KEY
    );
    expect(rows.map((row) => row.key)).toEqual(['PAY-172', 'PAY-170', 'PAY-173', 'PAY-171']);
  });

  it('gives null for a ticket with no assignee, so the page can say Unassigned', () => {
    const [row] = riskRows([ticket('PAY-174', 'Add refund webhooks', null, '2026-11-26T05:00:00.000Z', null)], KEY);
    expect(row.assignee).toBeNull();
  });

  it('counts a note that Stand Note did not sign by its saved time, and marks it', () => {
    const outside = ticket('PAY-175', 'Add refund report', null, '2026-11-26T07:00:00.000Z', note('2026-11-26T02:00:00.000Z'));
    expect(riskRows([outside], KEY)).toEqual([expect.objectContaining({ key: 'PAY-175', gapMs: 5 * HOUR, outside: true })]);
  });

  it('counts a note with no text or no valid saved time as no note', () => {
    const empty = ticket('PAY-176', 'Empty note', null, '2026-11-26T07:00:00.000Z', note('2026-11-26T07:00:00.000Z', { done: '', next: ' ', code: 7 }));
    const badTime = ticket('PAY-177', 'Bad time', null, '2026-11-26T07:00:00.000Z', note('yesterday'));
    const noTime = ticket('PAY-178', 'No time', null, '2026-11-26T07:00:00.000Z', note(undefined));
    expect(riskRows([empty, badTime, noTime], KEY).map(({ key, gapMs }) => [key, gapMs])).toEqual([
      ['PAY-176', null],
      ['PAY-177', null],
      ['PAY-178', null],
    ]);
  });

  it('keeps the gap of a note days behind', () => {
    const old = ticket('PAY-179', 'Old note', null, '2026-11-26T02:00:00.000Z', signed('PAY-179', '2026-11-24T02:00:00.000Z'));
    expect(riskRows([old], KEY)[0].gapMs).toBe(2 * DAY);
  });
});
