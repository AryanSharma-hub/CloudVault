/**
 * middleware/errorMiddleware.js
 * Centralized error handling: 404 for unmatched routes, 500 for uncaught
 * errors (including multer errors like file-too-large or bad file type).
 */

const { loggingService } = require('../services/serviceFactory');
const multer = require('multer');

function notFoundHandler(req, res) {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    user: req.session ? req.session.user : null,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  loggingService.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  // Multer-specific errors get a friendlier message.
  if (err instanceof multer.MulterError) {
    let message = 'File upload failed.';
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File exceeds the 50 MB size limit.';
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(400).json({ success: false, message });
    }
    req.session.flashError = message;
    return res.redirect(req.get('Referrer') || '/dashboard');
  }

  // Custom validation errors thrown with a `status` set by our own code.
  if (err.status && err.status < 500) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    req.session.flashError = err.message;
    return res.redirect(req.get('Referrer') || '/dashboard');
  }

  const status = err.status || 500;
  return res.status(status).render('errors/500', {
    title: 'Server Error',
    user: req.session ? req.session.user : null,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on our end.',
  });
}

module.exports = { notFoundHandler, errorHandler };
