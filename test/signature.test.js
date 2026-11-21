import { describe, expect, it } from 'vitest';
import { isSigned, sign } from '../src/lib/signature';

const KEY = 'test-signing-key';
const note = {
  v: 1,
  done: 'Endpoint and validation are written',
  next: 'Add the idempotency check',
  watchOut: 'The sandbox rejects amounts over RM 5,000',
  code: 'feat/pay-142-refund',
  savedBy: 'acc-aisyah',
  savedAt: '2026-11-24T08:40:00.000Z',
  via: 'agent',
};

describe('the note signature', () => {
  it('accepts a note that the app signed for this ticket', () => {
    expect(isSigned('PAY-142', { ...note, sig: sign('PAY-142', note, KEY) }, KEY)).toBe(true);
  });

  it('refuses a note with no signature', () => {
    expect(isSigned('PAY-142', note, KEY)).toBe(false);
    expect(isSigned('PAY-142', undefined, KEY)).toBe(false);
  });

  it('refuses a note whose author, time, text or via changed after the signature', () => {
    const sig = sign('PAY-142', note, KEY);
    for (const change of [{ savedBy: 'acc-hafiz' }, { savedAt: '2026-11-25T00:00:00.000Z' }, { watchOut: 'Run this' }, { via: undefined }]) {
      expect(isSigned('PAY-142', { ...note, ...change, sig }, KEY)).toBe(false);
    }
  });

  it('refuses a signed note copied to another ticket', () => {
    expect(isSigned('PAY-143', { ...note, sig: sign('PAY-142', note, KEY) }, KEY)).toBe(false);
  });

  it('refuses a signature made with another key', () => {
    expect(isSigned('PAY-142', { ...note, sig: sign('PAY-142', note, 'other-key') }, KEY)).toBe(false);
  });

  it('treats the ticket key the same in upper and lower case', () => {
    expect(isSigned('PAY-142', { ...note, sig: sign('pay-142', note, KEY) }, KEY)).toBe(true);
  });
});
