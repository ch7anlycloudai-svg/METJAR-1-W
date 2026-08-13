const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', settingsController.getSettings);

// Admin routes
router.put('/', authenticateAdmin, settingsController.updateSettings);

module.exports = router;
