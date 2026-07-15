const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/authMiddleware');

router.get('/register', redirectIfAuthenticated, authController.showRegisterForm);
router.post('/register', redirectIfAuthenticated, authController.register);

router.get('/login', redirectIfAuthenticated, authController.showLoginForm);
router.post('/login', redirectIfAuthenticated, authController.login);

router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

module.exports = router;
