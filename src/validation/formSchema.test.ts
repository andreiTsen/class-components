import { describe, expect, it } from 'vitest';
import { ValidationError } from 'yup';
import { createFormSchema } from './formSchema';

const countries = ['Poland', 'Ukraine'];
const validValues = {
  age: '36',
  avatarBase64: 'data:image/png;base64,YXZhdGFy',
  confirmPassword: 'Password1!',
  country: ' poland ',
  email: 'ada@example.com',
  gender: 'female',
  name: 'Ada Lovelace',
  password: 'Password1!',
  termsAccepted: true,
};

describe('createFormSchema', () => {
  it('accepts valid form values and normalizes country whitespace', async () => {
    await expect(
      createFormSchema(countries).validate(validValues)
    ).resolves.toMatchObject({
      country: 'poland',
    });
  });

  it('rejects invalid email, lowercase name, mismatched passwords, and unknown country', async () => {
    try {
      await createFormSchema(countries).validate(
        {
          ...validValues,
          confirmPassword: 'Password2!',
          country: 'Spain',
          email: 'ada@@example',
          name: 'ada Lovelace',
        },
        { abortEarly: false }
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);

      if (error instanceof ValidationError) {
        expect(error.errors).toEqual(
          expect.arrayContaining([
            'Name must start with a capital letter',
            'Enter a valid email',
            'Passwords must match',
            'Country must be selected from the list',
          ])
        );
      }
    }
  });
});
