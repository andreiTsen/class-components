import type { UseFormReturn } from 'react-hook-form';
import FieldError from '../FieldError/FieldError';
import type { FormValues } from '../../validation/formSchema';

type HookTermsSubmitProperties = {
  form: UseFormReturn<FormValues>;
};

function HookTermsSubmit({ form }: HookTermsSubmitProperties) {
  return (
    <>
      <div className="hook-form__checkbox-field">
        <input
          id="hook-form-terms"
          {...form.register('termsAccepted', {
            required: 'Terms must be accepted',
          })}
          aria-invalid={Boolean(form.formState.errors.termsAccepted)}
          type="checkbox"
        />
        <label htmlFor="hook-form-terms">Accept Terms and Conditions</label>
      </div>
      <FieldError message={form.formState.errors.termsAccepted?.message} />
      <button
        className="hook-form__submit"
        disabled={!form.formState.isValid}
        type="submit"
      >
        Submit
      </button>
    </>
  );
}

export default HookTermsSubmit;
