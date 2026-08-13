const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateAdmin } = require('../middleware/auth');
const {
  validateCouponCreation,
  validateCouponUpdate,
  validateCouponCode,
} = require('../middleware/validate');

// Public routes
router.post('/validate', validateCouponCode, couponController.validateCoupon);

// Admin routes
router.get('/', authenticateAdmin, couponController.getCoupons);
router.get('/:id', authenticateAdmin, couponController.getCoupon);
router.post('/', authenticateAdmin, validateCouponCreation, couponController.createCoupon);
router.put('/:id', authenticateAdmin, validateCouponUpdate, couponController.updateCoupon);
router.delete('/:id', authenticateAdmin, couponController.deleteCoupon);

module.exports = router;
