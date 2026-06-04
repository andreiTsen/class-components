import { useState } from 'react';
import { formSchema, type FormValues } from '../../validation/formSchema';
import './UncontrolledForm.css';

type UncontrolledFormProperties = {
  onSubmit: (values: FormValues) => void;
};

function getFormString(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  return typeof value === 'string' ? value : '';
}

async function validateFormData(formData: FormData): Promise<FormValues> {
  return formSchema.validate({
    age: getFormString(formData, 'age'),
    email: getFormString(formData, 'email'),
    gender: getFormString(formData, 'gender'),
    name: getFormString(formData, 'name'),
    termsAccepted: formData.has('termsAccepted'),
  });
}

function UncontrolledForm({ onSubmit }: UncontrolledFormProperties) {
  const errorMessageState = useState<string | null>(null);
  const errorMessage = errorMessageState[0];
  const setErrorMessage = errorMessageState[1];

  return (
    <form
      className="uncontrolled-form"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        void validateFormData(formData)
          .then((validatedValues) => {
            setErrorMessage(null);
            onSubmit(validatedValues);
          })
          .catch(() => {
            setErrorMessage('Please fill all fields correctly');
          });
      }}
    >
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-name">Name</label>
        <input
          data-modal-autofocus
          id="uncontrolled-name"
          name="name"
          required
        />
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-age">Age</label>
        <input
          id="uncontrolled-age"
          min="1"
          name="age"
          required
          type="number"
        />
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-email">Email</label>
        <input id="uncontrolled-email" name="email" required type="email" />
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-gender">Gender</label>
        <select id="uncontrolled-gender" name="gender" required>
          <option value="">Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>
      <div className="uncontrolled-form__checkbox-field">
        <input
          id="uncontrolled-terms"
          name="termsAccepted"
          required
          type="checkbox"
        />
        <label htmlFor="uncontrolled-terms">Accept Terms and Conditions</label>
      </div>
      {errorMessage ? (
        <span className="uncontrolled-form__error">{errorMessage}</span>
      ) : null}
      <button className="uncontrolled-form__submit" type="submit">
        Submit
      </button>
    </form>
  );
}

export default UncontrolledForm;
