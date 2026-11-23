const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { login } = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { loginBody } = require('../validation/schemas');

// Brute-force protection: only failed attempts count towards the limit.
const loginLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Inténtelo más tarde.' },
});

router.post('/login', loginLimiter, validate({ body: loginBody }), login);

module.exports = router;
