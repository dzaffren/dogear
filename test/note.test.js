import { describe, expect, it } from 'vitest';
import { cleanNote, MAX_LENGTH, PROPERTY_KEY, tooLong } from '../src/lib/note';

describe('PROPERTY_KEY', () => {
  it('stays the key from before the rename, so each old note still shows', () => {
    expect(PROPERTY_KEY).toBe('stand-note');
  });
});

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

describe('tooLong', () => {
  it('names each field over 1,000 characters, with its length after a trim', () => {
    expect(tooLong({ done: 'a'.repeat(1240), next: 'b'.repeat(1000), code: ` ${'c'.repeat(1001)} ` })).toEqual([
      { label: 'Done', length: 1240 },
      { label: 'Code', length: 1001 },
    ]);
  });

  it('finds nothing in a note within the limits, or a field that is not text', () => {
    expect(tooLong({ done: 'Endpoint and validation are written', next: 42 })).toEqual([]);
    expect(tooLong(undefined)).toEqual([]);
  });
});
