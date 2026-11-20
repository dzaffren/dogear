import React from 'react';
import { Button, Code, Link, Stack, Text } from '@forge/react';
import { ageLabel } from '../lib/age';

const Field = ({ label, children }) => (
  <Stack space="space.050">
    <Text size="small" weight="medium" color="color.text.subtle">
      {label}
    </Text>
    {children}
  </Stack>
);

// Code that starts with https:// is a link. Other text, such as a branch name, shows as code.
const CodeValue = ({ code }) =>
  code.startsWith('https://') ? (
    <Text>
      <Link href={code} openNewTab>
        {code}
      </Link>
    </Text>
  ) : (
    <Text>
      <Code>{code}</Code>
    </Text>
  );

const NoteView = ({ note, savedByName, canEdit, now, onEdit }) => {
  const age = ageLabel(note.savedAt, now);
  return (
    <Stack space="space.200">
      {note.done && (
        <Field label="Done">
          <Text>{note.done}</Text>
        </Field>
      )}
      {note.next && (
        <Field label="Next">
          <Text>{note.next}</Text>
        </Field>
      )}
      {note.watchOut && (
        <Field label="Watch out">
          <Text>{note.watchOut}</Text>
        </Field>
      )}
      {note.code && (
        <Field label="Code">
          <CodeValue code={note.code} />
        </Field>
      )}
      <Text size="small" color="color.text.subtlest">
        {`Saved by ${savedByName}, ${age.charAt(0).toLowerCase()}${age.slice(1)}`}
      </Text>
      {canEdit && (
        <Stack alignInline="start">
          <Button onClick={onEdit}>Edit</Button>
        </Stack>
      )}
    </Stack>
  );
};

export default NoteView;
