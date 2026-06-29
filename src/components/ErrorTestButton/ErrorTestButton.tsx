'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import './ErrorTestButton.css';

function ErrorTestButton() {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const t = useTranslations('TestError');

  const handleClick = (): void => {
    setShouldThrowError(true);
  };

  if (shouldThrowError) {
    throw new Error('Error for testing');
  }

  return (
    <button className="error-test-button" type="button" onClick={handleClick}>
      {t('button')}
    </button>
  );
}

export default ErrorTestButton;
