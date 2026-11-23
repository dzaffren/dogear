import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  DynamicTable,
  EmptyState,
  Heading,
  Inline,
  Link,
  Lozenge,
  SectionMessage,
  Spinner,
  Stack,
  Text,
} from '@forge/react';
import { invoke } from '@forge/bridge';
import { ageLabel, behindLabel } from '../lib/age';
import { currentLine } from '../lib/summary';

const HEAD = {
  cells: [
    { key: 'ticket', content: 'Ticket' },
    { key: 'assignee', content: 'Assignee' },
    { key: 'note', content: 'Dogear' },
    { key: 'change', content: 'Last change' },
  ],
};

// A ticket with no note is red. A note that is behind is yellow.
const NoteCell = ({ row }) => (
  <Stack space="space.050">
    <Inline>
      {row.gapMs === null ? (
        <Lozenge appearance="removed">No dogear</Lozenge>
      ) : (
        <Lozenge appearance="moved">{behindLabel(row.gapMs)}</Lozenge>
      )}
    </Inline>
    {row.outside && (
      <Text size="small" color="color.text.subtle">
        saved outside Dogear
      </Text>
    )}
  </Stack>
);

const tableRow = (row, now) => ({
  key: row.key,
  cells: [
    {
      key: 'ticket',
      content: (
        <Inline space="space.100">
          <Link href={`/browse/${row.key}`}>{row.key}</Link>
          <Text>{row.summary}</Text>
        </Inline>
      ),
    },
    { key: 'assignee', content: <Text>{row.assignee ?? 'Unassigned'}</Text> },
    { key: 'note', content: <NoteCell row={row} /> },
    { key: 'change', content: <Text>{ageLabel(row.updated, now)}</Text> },
  ],
});

const tickets = (count) => (count === 1 ? '1 in-progress ticket' : `${count} in-progress tickets`);

const App = () => {
  // `data` is what getAtRisk returns: { rows, checked, inProgress, now }.
  const [data, setData] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    invoke('getAtRisk')
      .then(setData)
      .catch(() => setLoadFailed(true));
  }, []);

  if (loadFailed) {
    return (
      <SectionMessage appearance="error">
        <Text>The list did not load. Reload the page.</Text>
      </SectionMessage>
    );
  }
  if (!data) return <Spinner label="Loading the at-risk list" />;

  const { rows, checked, inProgress, now } = data;
  if (checked === 0) {
    return (
      <EmptyState
        header="No ticket is in progress"
        description="The list checks the tickets whose status is in progress."
      />
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState header="No ticket is at risk" description={currentLine(checked, inProgress)} />
    );
  }

  return (
    <Stack space="space.200">
      <Stack space="space.050">
        <Heading size="medium">
          {rows.length} of {tickets(checked)} {rows.length === 1 && checked === 1 ? 'is' : 'are'} at risk
        </Heading>
        <Text size="small" color="color.text.subtle">
          A ticket is at risk when it has no dogear, or when it changed more than 1 hour after its dogear was
          saved.
        </Text>
        {inProgress > checked && (
          <Text size="small" color="color.text.subtle">
            Checked the {checked} most recently updated of about {inProgress} in-progress tickets.
          </Text>
        )}
      </Stack>
      <DynamicTable head={HEAD} rows={rows.map((row) => tableRow(row, now))} />
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
