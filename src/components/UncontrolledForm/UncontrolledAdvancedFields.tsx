import { useState, type ChangeEvent } from 'react';
import UncontrolledCountryField from './UncontrolledCountryField';
import PasswordStrength from '../PasswordStrength/PasswordStrength';
import { imageFileToBase64 } from '../../utils/imageFile';

type UncontrolledAdvancedFieldsProperties = {
  countries: string[];
  onImageError: (message: string) => void;
  onImageReady: () => void;
};

function UncontrolledAdvancedFields({
  countries,
  onImageError,
  onImageReady,
}: UncontrolledAdvancedFieldsProperties) {
  const avatarBase64State = useState('');
  const passwordState = useState('');
  const avatarBase64 = avatarBase64State[0];
  const setAvatarBase64 = avatarBase64State[1];
  const password = passwordState[0];
  const setPassword = passwordState[1];
  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const avatar = event.currentTarget.files?.item(0);

    if (!avatar) {
      setAvatarBase64('');
      return;
    }

    void imageFileToBase64(avatar)
      .then((nextAvatarBase64) => {
        setAvatarBase64(nextAvatarBase64);
        onImageReady();
      })
      .catch((error: unknown) => {
        setAvatarBase64('');
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
        <input
          name="avatarBase64"
          type="hidden"
          value={avatarBase64}
          readOnly
        />
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
      </div>
      <div className="uncontrolled-form__field">
        <label htmlFor="uncontrolled-confirm-password">Confirm password</label>
        <input
          id="uncontrolled-confirm-password"
          name="confirmPassword"
          required
          type="password"
        />
      </div>
      <UncontrolledCountryField countries={countries} />
    </>
  );
}

export default UncontrolledAdvancedFields;
