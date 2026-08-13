const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateAdmin } = require('../middleware/auth');

// Admin routes
router.get('/', authenticateAdmin, customerController.getCustomers);
router.get('/:id', authenticateAdmin, customerController.getCustomer);

module.exports = router;
