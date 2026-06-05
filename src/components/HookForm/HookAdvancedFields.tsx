import { useState, type ChangeEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import HookCountryField from './HookCountryField';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import { imageFileToBase64 } from '../../utils/imageFile';
import type { FormValues } from '../../validation/formSchema';

type HookAdvancedFieldsProperties = {
  countries: string[];
  form: UseFormReturn<FormValues>;
};

function HookAdvancedFields({ countries, form }: HookAdvancedFieldsProperties) {
  const passwordState = useState('');
  const password = passwordState[0];
  const setPassword = passwordState[1];
  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const avatar = event.currentTarget.files?.item(0);

    if (!avatar) {
      return;
    }

    void imageFileToBase64(avatar)
      .then((avatarBase64) => {
        form.setValue('avatarBase64', avatarBase64, {
          shouldValidate: true,
        });
      })
      .catch((error: unknown) => {
        form.setError('avatarBase64', {
          message:
            error instanceof Error ? error.message : 'Image could not be read',
          type: 'validation',
        });
      });
  };
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
    form.setValue('password', event.currentTarget.value, {
      shouldValidate: true,
    });
  };

  return (
    <>
      <div className="hook-form__field">
        <label htmlFor="hook-form-avatar">Profile image</label>
        <input
          accept="image/png,image/jpeg"
          id="hook-form-avatar"
          onChange={handleAvatarChange}
          required
          type="file"
        />
        <input type="hidden" {...form.register('avatarBase64')} />
      </div>
      <div className="hook-form__field">
        <label htmlFor="hook-form-password">Password</label>
        <input
          id="hook-form-password"
          {...form.register('password', { required: 'Password is required' })}
          aria-invalid={Boolean(form.formState.errors.password)}
          onChange={handlePasswordChange}
          type="password"
        />
        <PasswordStrength password={password} />
      </div>
      <div className="hook-form__field">
        <label htmlFor="hook-form-confirm-password">Confirm password</label>
        <input
          id="hook-form-confirm-password"
          {...form.register('confirmPassword', {
            required: 'Confirm password is required',
          })}
          aria-invalid={Boolean(form.formState.errors.confirmPassword)}
          type="password"
        />
      </div>
      <HookCountryField countries={countries} form={form} />
    </>
  );
}

export default HookAdvancedFields;
