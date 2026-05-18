import { useState } from 'react';

function ErrorTestButton() {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  const handleClick = () => {
    setShouldThrowError(true);
  };

  if (shouldThrowError) {
    throw new Error('Error for testing');
  }

  return (
    <button className="error-test-button" type="button" onClick={handleClick}>
      Test Error
    </button>
  );
}

export default ErrorTestButton;
