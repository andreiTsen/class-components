function UncontrolledBasicFields() {
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
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-email">Email</label>
        <input id="uncontrolled-email" name="email" required type="email" />
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-gender">Gender</label>
        <select id="uncontrolled-gender" name="gender" required>
          <option value="">Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>
    </>
  );
}

export default UncontrolledBasicFields;
