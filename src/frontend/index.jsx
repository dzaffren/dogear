import React, { useEffect, useState } from 'react';
import ForgeReconciler, { SectionMessage, Spinner, Stack, Text } from '@forge/react';
import { invoke } from '@forge/bridge';
import NoteView from './NoteView';
import NoteForm from './NoteForm';
import BriefView, { BriefButton } from './BriefView';

// The brief's texts for the note form. A heading that says "Not known" gives an empty field.
const formTexts = (brief) => Object.fromEntries(Object.entries(brief).map(([field, text]) => [field, text ?? '']));

const App = () => {
  // `data` is what getNote and saveNote return: { note, savedByName, canEdit, now }.
  const [data, setData] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  // The pick-up brief lives only in this state (D23): { brief, sourceLine }.
  const [brief, setBrief] = useState(null);
  const [building, setBuilding] = useState(false);
  // The message of the last try: tooLittle, failed or limit.
  const [briefMessage, setBriefMessage] = useState(null);
  const [usingBrief, setUsingBrief] = useState(false);

  useEffect(() => {
    invoke('getNote')
      .then(setData)
      .catch(() => setLoadFailed(true));
  }, []);

  const buildBrief = async () => {
    setBuilding(true);
    setBriefMessage(null);
    try {
      const result = await invoke('getBrief');
      if (result.status === 'brief') setBrief(result);
      else setBriefMessage(result.status);
    } catch {
      setBriefMessage('failed');
    }
    setBuilding(false);
  };

  if (loadFailed) {
    return (
      <SectionMessage appearance="error">
        <Text>The dogear did not load. Reload the page.</Text>
      </SectionMessage>
    );
  }
  if (!data) return <Spinner label="Loading the dogear" />;

  const { note, canEdit } = data;
  if (note && !editing) return <NoteView {...data} onEdit={() => setEditing(true)} />;

  // A brief can answer after a save from the plain form. Once a note exists, the brief is out of scope.
  if (!note && brief && usingBrief) {
    return (
      <NoteForm
        note={formTexts(brief.brief)}
        onSaved={(saved) => {
          setData(saved);
          setBrief(null);
          setUsingBrief(false);
        }}
        onCancel={() => setUsingBrief(false)}
      />
    );
  }
  if (!note && brief) return <BriefView {...brief} canEdit={canEdit} onUse={() => setUsingBrief(true)} />;

  const briefButton = !note && <BriefButton building={building} message={briefMessage} onBuild={buildBrief} />;
  if (!note && !canEdit) {
    return (
      <Stack space="space.150">
        <Text>No dogear yet</Text>
        {briefButton}
      </Stack>
    );
  }

  return (
    <NoteForm
      note={note}
      onSaved={(saved) => {
        setData(saved);
        setEditing(false);
      }}
      onCancel={() => setEditing(false)}
    >
      {briefButton}
    </NoteForm>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
