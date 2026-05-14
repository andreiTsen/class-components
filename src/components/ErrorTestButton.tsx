import { useState } from 'react';

function ErrorTestButton() {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  const handleClick = () => {
    setShouldThrowError(true);
  };

  if (shouldThrowError) {
    throw new Error('Ошібка для тестірованія');
  }

  return (
    <button
      className="error-test-button"
      onClick={handleClick}
    >
      Test Error
    </button>
  );
}

export default ErrorTestButton;
