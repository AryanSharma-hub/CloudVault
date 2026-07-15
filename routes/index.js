const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

router.use('/', require('./authRoutes'));
router.use('/', require('./fileRoutes'));
router.use('/', require('./userRoutes'));

module.exports = router;
