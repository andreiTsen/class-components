import { useState } from 'react';
import './App.css';
import FormActions from './components/FormActions/FormActions';
import HookForm from './components/HookForm/HookForm';
import Modal from './components/Modal/Modal';
import Submissions from './components/Submissions/Submissions';
import UncontrolledForm from './components/UncontrolledForm/UncontrolledForm';
import { useAppDispatch } from './store/hooks';
import {
  addSubmission,
  clearSubmissionHighlight,
} from './store/submissionsSlice';
import type { FormValues } from './validation/formSchema';

type FormType = 'uncontrolled' | 'hook-form';

const formTitles: Record<FormType, string> = {
  'hook-form': 'React Hook Form',
  uncontrolled: 'Uncontrolled Form',
};
const highlightDurationMs = 3000;

function App() {
  const dispatch = useAppDispatch();
  const activeFormState = useState<FormType | null>(null);
  const activeForm = activeFormState[0];
  const setActiveForm = activeFormState[1];

  const handleSubmit = (values: FormValues) => {
    if (!activeForm) {
      return;
    }

    dispatch(addSubmission({ ...values, formType: activeForm }));
    setActiveForm(null);
    globalThis.setTimeout(() => {
      dispatch(clearSubmissionHighlight());
    }, highlightDurationMs);
  };

  return (
    <main className="app">
      <h1 className="app__title">React Forms</h1>
      <FormActions
        onOpenHookForm={() => {
          setActiveForm('hook-form');
        }}
        onOpenUncontrolledForm={() => {
          setActiveForm('uncontrolled');
        }}
      />
      <Submissions />

      {activeForm ? (
        <Modal
          title={formTitles[activeForm]}
          onClose={() => {
            setActiveForm(null);
          }}
        >
          {activeForm === 'uncontrolled' ? (
            <UncontrolledForm onSubmit={handleSubmit} />
          ) : (
            <HookForm onSubmit={handleSubmit} />
          )}
        </Modal>
      ) : null}
    </main>
  );
}

export default App;
