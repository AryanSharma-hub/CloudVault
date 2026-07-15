/**
 * middleware/authMiddleware.js
 * Guards routes that require an authenticated session.
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.flashError = 'Please log in to continue.';
  return res.redirect('/login');
}

/**
 * Redirects already-authenticated users away from login/register pages.
 */
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  return next();
}

module.exports = { requireAuth, redirectIfAuthenticated };
