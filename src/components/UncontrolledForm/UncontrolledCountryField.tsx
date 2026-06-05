type UncontrolledCountryFieldProperties = {
  countries: string[];
};

function UncontrolledCountryField({
  countries,
}: UncontrolledCountryFieldProperties) {
  return (
    <div className="uncontrolled-form__field">
      <label htmlFor="uncontrolled-country">Country</label>
      <input
        id="uncontrolled-country"
        list="uncontrolled-country-options"
        name="country"
        required
      />
      <datalist id="uncontrolled-country-options">
        {countries.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
    </div>
  );
}

export default UncontrolledCountryField;
