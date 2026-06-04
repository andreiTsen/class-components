import * as yup from 'yup';

export type FormValues = {
  age: string;
  email: string;
  gender: string;
  name: string;
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
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  gender: yup.string().required('Gender is required'),
  name: yup.string().trim().required('Name is required'),
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'Terms must be accepted')
    .required('Terms must be accepted'),
});
