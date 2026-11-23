import React from 'react';
import { Button, Heading, Inline, LoadingButton, Lozenge, SectionMessage, Stack, Text } from '@forge/react';
import { FIELDS, LABELS } from '../lib/note';
import { CodeValue, Field } from './NoteView';

const MESSAGES = {
  tooLittle: { appearance: 'information', text: 'Jira has too little on this ticket for a brief.' },
  failed: { appearance: 'error', text: 'The brief did not build. Try again.' },
  limit: { appearance: 'warning', text: 'This site built its 50 briefs for today. Try again tomorrow.' },
};

// The button on a ticket with no dogear, with the message of the last try above it.
// After "too little" the button goes, because a second try gives the same answer.
export const BriefButton = ({ building, message, onBuild }) => (
  <Stack space="space.100">
    {message && (
      <SectionMessage appearance={MESSAGES[message].appearance}>
        <Text>{MESSAGES[message].text}</Text>
      </SectionMessage>
    )}
    {message !== 'tooLittle' && (
      <Stack alignInline="start">
        <LoadingButton isLoading={building} onClick={onBuild}>
          Build a brief from Jira
        </LoadingButton>
      </Stack>
    )}
  </Stack>
);

// The brief that AI built from Jira. It always shows the four headings, with "Not known"
// where the ticket does not say. Only a person who can edit the ticket can use it as the note.
const BriefView = ({ brief, sourceLine, canEdit, onUse }) => (
  <Stack space="space.200">
    <Stack space="space.050">
      <Inline space="space.100" alignBlock="center">
        <Heading size="small">Brief from Jira</Heading>
        <Lozenge appearance="new">AI</Lozenge>
      </Inline>
      <Text size="small" color="color.text.subtle">
        Not a dogear. Check it before you rely on it.
      </Text>
    </Stack>
    {FIELDS.map((field) => (
      <Field key={field} label={LABELS[field]}>
        {brief[field] === null ? (
          <Text color="color.text.subtlest">Not known</Text>
        ) : field === 'code' ? (
          <CodeValue code={brief.code} />
        ) : (
          <Text>{brief[field]}</Text>
        )}
      </Field>
    ))}
    <Text size="small" color="color.text.subtlest">
      {sourceLine}
    </Text>
    {canEdit && (
      <Stack alignInline="start">
        <Button appearance="primary" onClick={onUse}>
          Use as dogear
        </Button>
      </Stack>
    )}
  </Stack>
);

export default BriefView;
