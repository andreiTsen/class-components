import { useRef, useState } from 'react';
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

function getFormValues(formData: FormData, avatarBase64: string): FormValues {
  return {
    age: getFormString(formData, 'age'),
    avatarBase64,
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
  avatarBase64: string,
  countries: string[]
): Promise<FormValues> {
  return createFormSchema(countries).validate(
    getFormValues(formData, avatarBase64),
    {
      abortEarly: false,
    }
  );
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
  const avatarBase64Reference = useRef('');
  const avatarErrorReference = useRef('');
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

        void validateFormData(
          formData,
          avatarBase64Reference.current,
          countries
        )
          .then((validatedValues) => {
            if (avatarErrorReference.current) {
              setErrors({ avatarBase64: avatarErrorReference.current });
              return;
            }

            setErrors({});
            onSubmit(validatedValues);
            avatarBase64Reference.current = '';
            avatarErrorReference.current = '';
            event.currentTarget.reset();
          })
          .catch((error: unknown) => {
            const nextErrors =
              error instanceof ValidationError
                ? getValidationErrors(error)
                : {};

            setErrors({
              ...nextErrors,
              avatarBase64:
                avatarErrorReference.current || nextErrors.avatarBase64,
            });
          });
      }}
    >
      <UncontrolledBasicFields errors={errors} />
      <UncontrolledAdvancedFields
        countries={countries}
        errors={errors}
        onImageError={(message) => {
          avatarBase64Reference.current = '';
          avatarErrorReference.current = message;
        }}
        onImageReady={(avatarBase64) => {
          avatarBase64Reference.current = avatarBase64;
          avatarErrorReference.current = '';
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
