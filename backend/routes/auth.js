const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');

// POST /api/auth/login - Admin login
router.post('/login', authController.login);

// GET /api/auth/profile - Get admin profile (protected)
router.get('/profile', authenticateAdmin, authController.getProfile);

// PUT /api/auth/password - Change password (protected)
router.put('/password', authenticateAdmin, authController.changePassword);

module.exports = router;
