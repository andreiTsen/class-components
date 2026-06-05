import { useForm, type SubmitHandler } from 'react-hook-form';
import HookAdvancedFields from './HookAdvancedFields';
import HookTermsSubmit from './HookTermsSubmit';
import FieldError from '../FieldError/FieldError';
import { useAppSelector } from '../../store/hooks';
import './HookForm.css';
import type { FormValues } from '../../validation/formSchema';
import { yupResolver } from '../../validation/yupResolver';

type HookFormProperties = {
  onSubmit: (values: FormValues) => void;
};

function HookForm({ onSubmit }: HookFormProperties) {
  const countries = useAppSelector((state) => state.countries.items);
  const form = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(countries),
  });

  const submitHandler: SubmitHandler<FormValues> = (values) => {
    onSubmit(values);
  };

  return (
    <form
      className="hook-form"
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(submitHandler)(event);
      }}
    >
      <div className="hook-form__field">
        <label htmlFor="hook-form-name">Name</label>
        <input
          id="hook-form-name"
          {...form.register('name', { required: 'Name is required' })}
          aria-invalid={Boolean(form.formState.errors.name)}
          data-modal-autofocus
        />
        <FieldError message={form.formState.errors.name?.message} />
      </div>
      <div className="hook-form__field">
        <label htmlFor="hook-form-age">Age</label>
        <input
          id="hook-form-age"
          min="1"
          {...form.register('age', { required: 'Age is required' })}
          aria-invalid={Boolean(form.formState.errors.age)}
          type="number"
        />
        <FieldError message={form.formState.errors.age?.message} />
      </div>
      <div className="hook-form__field">
        <label htmlFor="hook-form-email">Email</label>
        <input
          id="hook-form-email"
          {...form.register('email', { required: 'Email is required' })}
          aria-invalid={Boolean(form.formState.errors.email)}
          type="email"
        />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="hook-form__field">
        <label htmlFor="hook-form-gender">Gender</label>
        <select
          id="hook-form-gender"
          {...form.register('gender', { required: 'Gender is required' })}
          aria-invalid={Boolean(form.formState.errors.gender)}
        >
          <option value="">Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        <FieldError message={form.formState.errors.gender?.message} />
      </div>
      <HookAdvancedFields countries={countries} form={form} />
      <HookTermsSubmit form={form} />
    </form>
  );
}

export default HookForm;
