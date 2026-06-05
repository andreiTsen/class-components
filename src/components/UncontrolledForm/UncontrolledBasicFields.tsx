import FieldError from '../FieldError/FieldError';
import type { FormErrors } from '../../validation/formSchema';

type UncontrolledBasicFieldsProperties = {
  errors: FormErrors;
};

function UncontrolledBasicFields({
  errors,
}: UncontrolledBasicFieldsProperties) {
  return (
    <>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-name">Name</label>
        <input
          data-modal-autofocus
          id="uncontrolled-name"
          name="name"
          required
        />
        <FieldError message={errors.name} />
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
        <FieldError message={errors.age} />
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-email">Email</label>
        <input id="uncontrolled-email" name="email" required type="email" />
        <FieldError message={errors.email} />
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-gender">Gender</label>
        <select id="uncontrolled-gender" name="gender" required>
          <option value="">Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        <FieldError message={errors.gender} />
      </div>
    </>
  );
}

export default UncontrolledBasicFields;
