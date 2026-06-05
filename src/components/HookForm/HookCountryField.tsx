import type { UseFormReturn } from 'react-hook-form';
import type { FormValues } from '../../validation/formSchema';

type HookCountryFieldProperties = {
  countries: string[];
  form: UseFormReturn<FormValues>;
};

function HookCountryField({ countries, form }: HookCountryFieldProperties) {
  return (
    <div className="hook-form__field">
      <label htmlFor="hook-form-country">Country</label>
      <input
        id="hook-form-country"
        list="hook-form-country-options"
        {...form.register('country', { required: 'Country is required' })}
        aria-invalid={Boolean(form.formState.errors.country)}
      />
      <datalist id="hook-form-country-options">
        {countries.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
    </div>
  );
}

export default HookCountryField;
