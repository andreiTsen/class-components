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

export const formSchema: yup.ObjectSchema<FormValues> = yup.object({
  age: yup
    .string()
    .required('Age is required')
    .test('positive-age', 'Age must be greater than 0', (value) => {
      const age = Number(value);

      return Number.isFinite(age) && age > 0;
    }),
  avatarBase64: yup.string().required('Profile image is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  country: yup.string().required('Country is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  gender: yup.string().required('Gender is required'),
  name: yup.string().trim().required('Name is required'),
  password: yup
    .string()
    .required('Password is required')
    .matches(/\d/, 'Password must include 1 digit')
    .matches(/[A-Z]/, 'Password must include 1 uppercase letter')
    .matches(/[a-z]/, 'Password must include 1 lowercase letter')
    .matches(/[^A-Za-z0-9]/, 'Password must include 1 special character'),
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'Terms must be accepted')
    .required('Terms must be accepted'),
});
