import './PasswordStrength.css';

type PasswordStrengthProperties = {
  password: string;
};

const checks = [
  {
    label: '1 digit',
    test: (password: string): boolean => /\d/.test(password),
  },
  {
    label: '1 uppercase letter',
    test: (password: string): boolean => /[A-Z]/.test(password),
  },
  {
    label: '1 lowercase letter',
    test: (password: string): boolean => /[a-z]/.test(password),
  },
  {
    label: '1 special character',
    test: (password: string): boolean => /[^A-Za-z0-9]/.test(password),
  },
];

function PasswordStrength({ password }: PasswordStrengthProperties) {
  return (
    <ul className="password-strength" aria-label="Password strength">
      {checks.map((check) => {
        const isPassed = check.test(password);

        return (
          <li
            className={
              isPassed
                ? 'password-strength__item password-strength__item--passed'
                : 'password-strength__item'
            }
            key={check.label}
          >
            {check.label}
          </li>
        );
      })}
    </ul>
  );
}

export default PasswordStrength;
