import React, { useEffect, useState } from 'react';
import ForgeReconciler, { SectionMessage, Spinner, Text } from '@forge/react';
import { invoke } from '@forge/bridge';
import NoteView from './NoteView';
import NoteForm from './NoteForm';

const App = () => {
  // `data` is what getNote and saveNote return: { note, savedByName, canEdit, now }.
  const [data, setData] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    invoke('getNote')
      .then(setData)
      .catch(() => setLoadFailed(true));
  }, []);

  if (loadFailed) {
    return (
      <SectionMessage appearance="error">
        <Text>The note did not load. Reload the page.</Text>
      </SectionMessage>
    );
  }
  if (!data) return <Spinner label="Loading the stand note" />;

  const { note, canEdit } = data;
  if (!note && !canEdit) return <Text>No stand note yet</Text>;
  if (note && !editing) return <NoteView {...data} onEdit={() => setEditing(true)} />;

  return (
    <NoteForm
      note={note}
      onSaved={(saved) => {
        setData(saved);
        setEditing(false);
      }}
      onCancel={() => setEditing(false)}
    />
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
