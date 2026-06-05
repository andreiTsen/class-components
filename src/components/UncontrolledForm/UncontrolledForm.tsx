import { useState } from 'react';
import UncontrolledAdvancedFields from './UncontrolledAdvancedFields';
import UncontrolledBasicFields from './UncontrolledBasicFields';
import { useAppSelector } from '../../store/hooks';
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
    avatarBase64: getFormString(formData, 'avatarBase64'),
    confirmPassword: getFormString(formData, 'confirmPassword'),
    country: getFormString(formData, 'country'),
    email: getFormString(formData, 'email'),
    gender: getFormString(formData, 'gender'),
    name: getFormString(formData, 'name'),
    password: getFormString(formData, 'password'),
    termsAccepted: formData.has('termsAccepted'),
  });
}

function UncontrolledForm({ onSubmit }: UncontrolledFormProperties) {
  const countries = useAppSelector((state) => state.countries.items);
  const errorMessageState = useState<string | null>(null);
  const errorMessage = errorMessageState[0];
  const setErrorMessage = errorMessageState[1];

  return (
    <form
      className="uncontrolled-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        void validateFormData(formData)
          .then((validatedValues) => {
            setErrorMessage(null);
            onSubmit(validatedValues);
          })
          .catch((error: unknown) => {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : 'Please fill all fields correctly'
            );
          });
      }}
    >
      <UncontrolledBasicFields />
      <UncontrolledAdvancedFields
        countries={countries}
        onImageError={setErrorMessage}
        onImageReady={() => {
          setErrorMessage(null);
        }}
      />
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
