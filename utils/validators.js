/**
 * utils/validators.js
 * Pure validation helper functions used by controllers before delegating
 * to services.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function isStrongEnoughPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function validateRegistration({ firstName, lastName, email, password, confirmPassword }) {
  const errors = [];

  if (!firstName || firstName.trim().length < 1) errors.push('First name is required.');
  if (!lastName || lastName.trim().length < 1) errors.push('Last name is required.');
  if (!email || !isValidEmail(email)) errors.push('A valid email address is required.');
  if (!password || !isStrongEnoughPassword(password)) errors.push('Password must be at least 6 characters long.');
  if (password !== confirmPassword) errors.push('Password and confirmation do not match.');

  return errors;
}

function validateLogin({ email, password }) {
  const errors = [];
  if (!email || !isValidEmail(email)) errors.push('A valid email address is required.');
  if (!password) errors.push('Password is required.');
  return errors;
}

module.exports = {
  isValidEmail,
  isStrongEnoughPassword,
  validateRegistration,
  validateLogin,
};
