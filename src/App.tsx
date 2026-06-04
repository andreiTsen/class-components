import { useState } from 'react';
import './App.css';
import FormActions from './components/FormActions/FormActions';
import HookForm from './components/HookForm/HookForm';
import Modal from './components/Modal/Modal';
import Submissions from './components/Submissions/Submissions';
import UncontrolledForm from './components/UncontrolledForm/UncontrolledForm';

type ActiveForm = 'uncontrolled' | 'hook-form';

type AppFormValues = {
  email: string;
  name: string;
};

type AppSubmission = AppFormValues & {
  formType: ActiveForm;
  id: string;
};

const formTitles: Record<ActiveForm, string> = {
  'hook-form': 'React Hook Form',
  uncontrolled: 'Uncontrolled Form',
};

function App() {
  const activeFormState = useState<ActiveForm | null>(null);
  const submissionsState = useState<AppSubmission[]>([]);
  const activeForm = activeFormState[0];
  const setActiveForm = activeFormState[1];
  const submissions = submissionsState[0];
  const setSubmissions = submissionsState[1];

  const handleSubmit = (values: AppFormValues) => {
    if (!activeForm) {
      return;
    }

    setSubmissions((currentSubmissions) => [
      ...currentSubmissions,
      {
        ...values,
        formType: activeForm,
        id: `${activeForm}-${Date.now().toString()}`,
      },
    ]);
    setActiveForm(null);
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
      <Submissions submissions={submissions} />

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
