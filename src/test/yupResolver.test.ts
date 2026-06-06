import { describe, expect, it } from 'vitest';
import { yupResolver } from '../validation/yupResolver';

const validValues = {
  age: '36',
  avatarBase64: 'data:image/png;base64,YXZhdGFy',
  confirmPassword: 'Password1!',
  country: 'Poland',
  email: 'ada@example.com',
  gender: 'female',
  name: 'Ada Lovelace',
  password: 'Password1!',
  termsAccepted: true,
};

describe('yupResolver', () => {
  it('returns values for valid form data', async () => {
    await expect(
      yupResolver(['Poland'])(validValues, undefined, {
        criteriaMode: 'firstError',
        fields: {},
        names: [],
        shouldUseNativeValidation: false,
      })
    ).resolves.toMatchObject({
      errors: {},
      values: validValues,
    });
  });

  it('returns field errors for invalid form data', async () => {
    await expect(
      yupResolver(['Poland'])(
        {
          ...validValues,
          country: 'Spain',
          name: 'ada Lovelace',
        },
        undefined,
        {
          criteriaMode: 'firstError',
          fields: {},
          names: [],
          shouldUseNativeValidation: false,
        }
      )
    ).resolves.toMatchObject({
      errors: {
        country: {
          message: 'Country must be selected from the list',
        },
        name: {
          message: 'Name must start with a capital letter',
        },
      },
      values: {},
    });
  });
});
