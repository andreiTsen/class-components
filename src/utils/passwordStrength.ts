export type PasswordStrengthCheck = {
  label: string;
  passed: boolean;
};

const passwordChecks = [
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

export function getPasswordStrengthChecks(
  password: string
): PasswordStrengthCheck[] {
  return passwordChecks.map((check) => ({
    label: check.label,
    passed: check.test(password),
  }));
}
