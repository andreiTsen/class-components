import { useState } from 'react';
import { ValidationError } from 'yup';
import UncontrolledAdvancedFields from './UncontrolledAdvancedFields';
import UncontrolledBasicFields from './UncontrolledBasicFields';
import FieldError from '../FieldError/FieldError';
import { useAppSelector } from '../../store/hooks';
import {
  createFormSchema,
  type FormErrors,
  type FormValues,
} from '../../validation/formSchema';
import './UncontrolledForm.css';

type UncontrolledFormProperties = {
  onSubmit: (values: FormValues) => void;
};

function getFormString(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  return typeof value === 'string' ? value : '';
}

function getFormValues(formData: FormData): FormValues {
  return {
    age: getFormString(formData, 'age'),
    avatarBase64: getFormString(formData, 'avatarBase64'),
    confirmPassword: getFormString(formData, 'confirmPassword'),
    country: getFormString(formData, 'country'),
    email: getFormString(formData, 'email'),
    gender: getFormString(formData, 'gender'),
    name: getFormString(formData, 'name'),
    password: getFormString(formData, 'password'),
    termsAccepted: formData.has('termsAccepted'),
  };
}

async function validateFormData(
  formData: FormData,
  countries: string[]
): Promise<FormValues> {
  return createFormSchema(countries).validate(getFormValues(formData), {
    abortEarly: false,
  });
}

function getValidationErrors(error: ValidationError): FormErrors {
  return Object.fromEntries(
    error.inner.map((validationError) => [
      validationError.path ?? '',
      validationError.message,
    ])
  );
}

function UncontrolledForm({ onSubmit }: UncontrolledFormProperties) {
  const countries = useAppSelector((state) => state.countries.items);
  const errorsState = useState<FormErrors>({});
  const errors = errorsState[0];
  const setErrors = errorsState[1];

  return (
    <form
      className="uncontrolled-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        void validateFormData(formData, countries)
          .then((validatedValues) => {
            setErrors({});
            onSubmit(validatedValues);
          })
          .catch((error: unknown) => {
            setErrors(
              error instanceof ValidationError ? getValidationErrors(error) : {}
            );
          });
      }}
    >
      <UncontrolledBasicFields errors={errors} />
      <UncontrolledAdvancedFields
        countries={countries}
        errors={errors}
        onImageError={(message) => {
          setErrors((currentErrors) => ({
            ...currentErrors,
            avatarBase64: message,
          }));
        }}
        onImageReady={() => {
          setErrors((currentErrors) => ({
            ...currentErrors,
            avatarBase64: undefined,
          }));
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
      <FieldError message={errors.termsAccepted} />
      <button className="uncontrolled-form__submit" type="submit">
        Submit
      </button>
    </form>
  );
}

export default UncontrolledForm;
