import { describe, expect, it } from 'vitest';
import { cleanNote, MAX_LENGTH } from '../src/lib/note';

describe('cleanNote', () => {
  it('keeps the four texts, trimmed', () => {
    expect(
      cleanNote({
        done: '  Endpoint and validation are written ',
        next: 'Add the idempotency check',
        watchOut: 'The sandbox rejects amounts over RM 5,000',
        code: 'feat/pay-142-refund\n',
      })
    ).toEqual({
      done: 'Endpoint and validation are written',
      next: 'Add the idempotency check',
      watchOut: 'The sandbox rejects amounts over RM 5,000',
      code: 'feat/pay-142-refund',
    });
  });

  it('caps each field at 1,000 characters', () => {
    const note = cleanNote({ done: 'a'.repeat(MAX_LENGTH + 50) });
    expect(MAX_LENGTH).toBe(1000);
    expect(note.done).toHaveLength(1000);
  });

  it('turns a missing or non-text field into an empty string', () => {
    expect(cleanNote({ next: 'Add the idempotency check', code: 42 })).toEqual({
      done: '',
      next: 'Add the idempotency check',
      watchOut: '',
      code: '',
    });
  });

  it('drops fields it does not know', () => {
    expect(cleanNote({ done: 'x', savedBy: 'someone' })).not.toHaveProperty('savedBy');
  });

  it('refuses a note with four empty fields', () => {
    expect(cleanNote({ done: ' ', next: '', watchOut: '\n' })).toBeNull();
    expect(cleanNote(undefined)).toBeNull();
  });
});
