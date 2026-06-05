import FieldError from '../FieldError/FieldError';

type UncontrolledCountryFieldProperties = {
  countries: string[];
  error?: string;
};

function UncontrolledCountryField({
  countries,
  error,
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
      <FieldError message={error} />
    </div>
  );
}

export default UncontrolledCountryField;
