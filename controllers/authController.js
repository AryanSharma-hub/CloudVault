/**
 * controllers/authController.js
 *
 * Handles registration, login, and logout. Talks ONLY to MetadataService
 * (for user persistence) and LoggingService - never to SQL/repositories
 * directly.
 */

const bcrypt = require('bcryptjs');
const { metadataService, loggingService } = require('../services/serviceFactory');
const { validateRegistration, validateLogin } = require('../utils/validators');

const SALT_ROUNDS = 10;

exports.showRegisterForm = (req, res) => {
  res.render('auth/register', {
    title: 'Create Account',
    errors: [],
    formData: {},
    user: null,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    const errors = validateRegistration({ firstName, lastName, email, password, confirmPassword });

    if (errors.length) {
      return res.status(400).render('auth/register', {
        title: 'Create Account',
        errors,
        formData: { firstName, lastName, email },
        user: null,
      });
    }

    const existingUser = await metadataService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).render('auth/register', {
        title: 'Create Account',
        errors: ['An account with this email already exists.'],
        formData: { firstName, lastName, email },
        user: null,
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await metadataService.createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      passwordHash,
    });

    loggingService.info('New user registered', { userId: newUser.id, email: newUser.email });

    // Auto-login after registration.
    req.session.userId = newUser.id;
    req.session.user = newUser.toSafeObject();

    return res.redirect('/dashboard');
  } catch (err) {
    return next(err);
  }
};

exports.showLoginForm = (req, res) => {
  const flashError = req.session.flashError;
  req.session.flashError = null;
  res.render('auth/login', {
    title: 'Log In',
    errors: flashError ? [flashError] : [],
    formData: {},
    user: null,
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = validateLogin({ email, password });

    if (errors.length) {
      return res.status(400).render('auth/login', {
        title: 'Log In',
        errors,
        formData: { email },
        user: null,
      });
    }

    const user = await metadataService.getUserByEmail(email);
    if (!user) {
      loggingService.warning('Login attempt with unknown email', { email });
      return res.status(401).render('auth/login', {
        title: 'Log In',
        errors: ['Invalid email or password.'],
        formData: { email },
        user: null,
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      loggingService.warning('Login attempt with incorrect password', { email, userId: user.id });
      return res.status(401).render('auth/login', {
        title: 'Log In',
        errors: ['Invalid email or password.'],
        formData: { email },
        user: null,
      });
    }

    req.session.userId = user.id;
    req.session.user = user.toSafeObject();
    loggingService.info('User logged in', { userId: user.id, email: user.email });

    return res.redirect('/dashboard');
  } catch (err) {
    return next(err);
  }
};

exports.logout = (req, res) => {
  const userId = req.session.userId;
  req.session.destroy((err) => {
    if (err) {
      loggingService.error('Error destroying session on logout', { userId, error: err.message });
    } else {
      loggingService.info('User logged out', { userId });
    }
    res.redirect('/login');
  });
};
