import { useState, type ChangeEvent } from 'react';
import UncontrolledCountryField from './UncontrolledCountryField';
import FieldError from '../FieldError/FieldError';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import { imageFileToBase64 } from '../../utils/imageFile';
import type { FormErrors } from '../../validation/formSchema';

type UncontrolledAdvancedFieldsProperties = {
  countries: string[];
  errors: FormErrors;
  onImageError: (message: string) => void;
  onImageReady: (avatarBase64: string) => void;
};

function UncontrolledAdvancedFields({
  countries,
  errors,
  onImageError,
  onImageReady,
}: UncontrolledAdvancedFieldsProperties) {
  const passwordState = useState('');
  const password = passwordState[0];
  const setPassword = passwordState[1];
  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const avatar = event.currentTarget.files?.item(0);

    if (!avatar) {
      onImageError('Profile image is required');
      return;
    }

    void imageFileToBase64(avatar)
      .then((nextAvatarBase64) => {
        onImageReady(nextAvatarBase64);
      })
      .catch((error: unknown) => {
        onImageError(
          error instanceof Error ? error.message : 'Image could not be read'
        );
      });
  };
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };

  return (
    <>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-avatar">Profile image</label>
        <input
          accept="image/png,image/jpeg"
          id="uncontrolled-avatar"
          name="avatar"
          onChange={handleAvatarChange}
          required
          type="file"
        />
        <FieldError message={errors.avatarBase64} />
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-password">Password</label>
        <input
          id="uncontrolled-password"
          name="password"
          onChange={handlePasswordChange}
          required
          type="password"
        />
        <PasswordStrength password={password} />
        <FieldError message={errors.password} />
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-confirm-password">Confirm password</label>
        <input
          id="uncontrolled-confirm-password"
          name="confirmPassword"
          required
          type="password"
        />
        <FieldError message={errors.confirmPassword} />
      </div>
      <UncontrolledCountryField countries={countries} error={errors.country} />
    </>
  );
}

export default UncontrolledAdvancedFields;
