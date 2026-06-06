import './PasswordStrength.css';
import { getPasswordStrengthChecks } from '../../utils/passwordStrength';

type PasswordStrengthProperties = {
  password: string;
};

function PasswordStrength({ password }: PasswordStrengthProperties) {
  return (
    <ul className="password-strength" aria-label="Password strength">
      {getPasswordStrengthChecks(password).map((check) => {
        return (
          <li
            className={
              check.passed
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
