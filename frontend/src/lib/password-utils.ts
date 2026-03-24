export const passwordRules = {
  minLength: 8,
  hasUpper: /[A-Z]/,
  hasLower: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
};

export function validatePassword(password: string) {
  return {
    minLength: password.length >= passwordRules.minLength,
    hasUpper: passwordRules.hasUpper.test(password),
    hasLower: passwordRules.hasLower.test(password),
    hasNumber: passwordRules.hasNumber.test(password),
    hasSpecial: passwordRules.hasSpecial.test(password),
  };
}

export function isPasswordValid(password: string) {
  const results = validatePassword(password);
  return Object.values(results).every(Boolean);
}
