import './FieldError.css';

type FieldErrorProperties = {
  message?: string;
};

function FieldError({ message }: FieldErrorProperties) {
  return message ? <span className="field-error">{message}</span> : null;
}

export default FieldError;
