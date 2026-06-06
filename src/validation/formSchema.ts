import * as yup from 'yup';

export type FormValues = {
  age: string;
  avatarBase64: string;
  confirmPassword: string;
  country: string;
  email: string;
  gender: string;
  name: string;
  password: string;
  termsAccepted: boolean;
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

const ageSchema = yup
  .string()
  .required('Age is required')
  .test('valid-age', 'Age must be a non-negative number', (value) => {
    const age = Number(value);

    return Number.isFinite(age) && age >= 0;
  });
const passwordSchema = yup.string().required('Password is required');

function isValidEmail(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const parts = value.split('@');
  const localPart = parts[0];
  const domain = parts[1];

  return (
    parts.length === 2 &&
    Boolean(localPart) &&
    Boolean(domain) &&
    domain.includes('.') &&
    !domain.startsWith('.') &&
    !domain.endsWith('.')
  );
}

function createNameSchema(): yup.StringSchema<string> {
  return yup
    .string()
    .trim()
    .required('Name is required')
    .test(
      'capitalized-name',
      'Name must start with a capital letter',
      (value) => {
        if (typeof value !== 'string' || value.length === 0) {
          return false;
        }

        return value.startsWith(value.charAt(0).toUpperCase());
      }
    );
}

function normalizeCountry(country: string): string {
  return country.trim().toLowerCase();
}

function createCountrySchema(countries: string[]): yup.StringSchema<string> {
  const normalizedCountries = new Set(
    countries.map((country) => normalizeCountry(country))
  );

  return yup
    .string()
    .trim()
    .required('Country is required')
    .test('listed-country', 'Country must be selected from the list', (value) =>
      Boolean(value && normalizedCountries.has(normalizeCountry(value)))
    );
}

export function createFormSchema(
  countries: string[]
): yup.ObjectSchema<FormValues> {
  return yup.object({
    age: ageSchema,
    avatarBase64: yup.string().required('Profile image is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
    country: createCountrySchema(countries),
    email: yup
      .string()
      .test('valid-email', 'Enter a valid email', isValidEmail)
      .required('Email is required'),
    gender: yup.string().required('Gender is required'),
    name: createNameSchema(),
    password: passwordSchema,
    termsAccepted: yup
      .boolean()
      .oneOf([true], 'Terms must be accepted')
      .required('Terms must be accepted'),
  });
}
