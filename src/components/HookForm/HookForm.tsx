import { useForm, type SubmitHandler } from 'react-hook-form';
import './HookForm.css';

type HookFormValues = {
  email: string;
  name: string;
};

type HookFormProperties = {
  onSubmit: (values: HookFormValues) => void;
};

function HookForm({ onSubmit }: HookFormProperties) {
  const form = useForm<HookFormValues>();

  const submitHandler: SubmitHandler<HookFormValues> = (values) => {
    onSubmit(values);
  };

  return (
    <form
      className="hook-form"
      onSubmit={(event) => {
        void form.handleSubmit(submitHandler)(event);
      }}
    >
      <label className="hook-form__field">
        Name
        <input
          {...form.register('name', { required: 'Name is required' })}
          aria-invalid={Boolean(form.formState.errors.name)}
          data-modal-autofocus
        />
        {form.formState.errors.name ? (
          <span className="hook-form__error">
            {form.formState.errors.name.message}
          </span>
        ) : null}
      </label>
      <label className="hook-form__field">
        Email
        <input
          {...form.register('email', { required: 'Email is required' })}
          aria-invalid={Boolean(form.formState.errors.email)}
          type="email"
        />
        {form.formState.errors.email ? (
          <span className="hook-form__error">
            {form.formState.errors.email.message}
          </span>
        ) : null}
      </label>
      <button className="hook-form__submit" type="submit">
        Submit
      </button>
    </form>
  );
}

export default HookForm;
