import './FormActions.css';

type FormActionsProperties = {
  onOpenHookForm: () => void;
  onOpenUncontrolledForm: () => void;
};

function FormActions({
  onOpenHookForm,
  onOpenUncontrolledForm,
}: FormActionsProperties) {
  return (
    <section className="form-actions">
      <button
        className="form-actions__button"
        type="button"
        onClick={onOpenUncontrolledForm}
      >
        Open Uncontrolled Form
      </button>
      <button
        className="form-actions__button"
        type="button"
        onClick={onOpenHookForm}
      >
        Open React Hook Form
      </button>
    </section>
  );
}

export default FormActions;
