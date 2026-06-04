import { useRef } from 'react';
import type { FormValues } from '../../types';
import './UncontrolledForm.css';

type UncontrolledFormProperties = {
  onSubmit: (values: FormValues) => void;
};

function UncontrolledForm({ onSubmit }: UncontrolledFormProperties) {
  const nameReference = useRef<HTMLInputElement>(null);
  const emailReference = useRef<HTMLInputElement>(null);

  return (
    <form
      className="uncontrolled-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          email: emailReference.current?.value ?? '',
          name: nameReference.current?.value ?? '',
        });
      }}
    >
      <label className="uncontrolled-form__field">
        Name
        <input data-modal-autofocus name="name" ref={nameReference} required />
      </label>
      <label className="uncontrolled-form__field">
        Email
        <input name="email" ref={emailReference} required type="email" />
      </label>
      <button className="uncontrolled-form__submit" type="submit">
        Submit
      </button>
    </form>
  );
}

export default UncontrolledForm;
