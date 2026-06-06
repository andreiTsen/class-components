import './FieldError.css';

type FieldErrorProperties = {
  message?: string;
};

function FieldError({ message }: FieldErrorProperties) {
  return (
    <span aria-live="polite" className="field-error">
      {message ?? ''}
    </span>
  );
}

export default FieldError;
