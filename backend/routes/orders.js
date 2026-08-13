const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateAdmin } = require('../middleware/auth');
const { validateOrderCreation, validateOrderStatus } = require('../middleware/validate');

// Public routes
router.post('/', validateOrderCreation, orderController.createOrder);

// Admin routes
router.get('/', authenticateAdmin, orderController.getOrders);
router.get('/:id', authenticateAdmin, orderController.getOrder);
router.put('/:id/status', authenticateAdmin, validateOrderStatus, orderController.updateOrderStatus);

module.exports = router;
