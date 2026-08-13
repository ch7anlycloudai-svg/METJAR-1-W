const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/sections', homepageController.getSections);

// Admin routes
router.put('/hero', authenticateAdmin, homepageController.updateHero);
router.put('/banner', authenticateAdmin, homepageController.updateBanner);
router.post('/sections', authenticateAdmin, homepageController.createSection);
router.put('/sections/:id', authenticateAdmin, homepageController.updateSection);
router.delete('/sections/:id', authenticateAdmin, homepageController.deleteSection);

module.exports = router;
