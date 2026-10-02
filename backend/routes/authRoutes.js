const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const protect = require('../middleware/auth');
const authLimiter = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

const registrationUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

router.post('/register', authLimiter, registrationUpload, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;
