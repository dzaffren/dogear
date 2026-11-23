import React, { useState } from 'react';
import { Button, Inline, Label, LoadingButton, SectionMessage, Stack, Text, TextArea, Textfield } from '@forge/react';
import { invoke } from '@forge/bridge';
import { MAX_LENGTH } from '../lib/note';

const EMPTY = { done: '', next: '', watchOut: '', code: '' };

// The fields live in React state (D11), so Save can watch them and Cancel can drop the changes.
// The panel puts the brief's button in `children`, under the intro text.
const NoteForm = ({ note, onSaved, onCancel, children }) => {
  const [texts, setTexts] = useState(() => (note ? { ...EMPTY, ...note } : EMPTY));
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const isEmpty = Object.keys(EMPTY).every((field) => texts[field].trim() === '');
  const set = (field) => (event) => setTexts((current) => ({ ...current, [field]: event.target.value }));

  const save = async () => {
    setSaving(true);
    setSaveFailed(false);
    try {
      const { done, next, watchOut, code } = texts;
      onSaved(await invoke('saveNote', { done, next, watchOut, code }));
    } catch {
      setSaveFailed(true);
      setSaving(false);
    }
  };

  const area = (field, label, placeholder) => (
    <Stack space="space.050">
      <Label labelFor={`dogear-${field}`}>{label}</Label>
      <TextArea
        id={`dogear-${field}`}
        value={texts[field]}
        onChange={set(field)}
        placeholder={placeholder}
        minimumRows={2}
        resize="smart"
        maxLength={MAX_LENGTH}
        isReadOnly={saving}
      />
    </Stack>
  );

  return (
    <Stack space="space.150">
      {!note && (
        <Stack space="space.050">
          <Text weight="medium">No dogear yet</Text>
          <Text>Mark where you stopped, so a teammate can carry on.</Text>
        </Stack>
      )}
      {children}
      {area('done', 'Done', 'What is finished')}
      {area('next', 'Next', 'The next step')}
      {area('watchOut', 'Watch out', 'Traps, and what you tried that failed')}
      <Stack space="space.050">
        <Label labelFor="dogear-code">Code</Label>
        <Textfield
          id="dogear-code"
          value={texts.code}
          onChange={set('code')}
          placeholder="Branch name or link"
          maxLength={MAX_LENGTH}
          isReadOnly={saving}
        />
      </Stack>
      {saveFailed && (
        <SectionMessage appearance="error">
          <Text>The dogear was not saved. Try again.</Text>
        </SectionMessage>
      )}
      <Inline space="space.100">
        <LoadingButton appearance="primary" isLoading={saving} isDisabled={isEmpty} onClick={save}>
          Save
        </LoadingButton>
        {note && (
          <Button appearance="subtle" onClick={onCancel} isDisabled={saving}>
            Cancel
          </Button>
        )}
      </Inline>
    </Stack>
  );
};

export default NoteForm;
