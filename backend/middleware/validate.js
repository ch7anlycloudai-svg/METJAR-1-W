const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/helpers');

/**
 * Run validation and return errors if any.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return errorResponse(res, messages.join('. '), 400);
  }
  next();
}

// --- Order validation ---
const validateOrderCreation = [
  body('customer_name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required.')
    .isLength({ max: 100 })
    .withMessage('Customer name must be at most 100 characters.')
    .escape(),
  body('customer_phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .isLength({ max: 30 })
    .withMessage('Phone number must be at most 30 characters.'),
  body('province')
    .trim()
    .notEmpty()
    .withMessage('Province is required.')
    .isLength({ max: 100 })
    .withMessage('Province must be at most 100 characters.')
    .escape(),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 500 })
    .withMessage('Address must be at most 500 characters.')
    .escape(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be at most 1000 characters.')
    .escape(),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item.'),
  body('items.*.product_id')
    .notEmpty()
    .withMessage('Product ID is required for each item.'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1.'),
  body('items.*.color')
    .optional()
    .trim()
    .escape(),
  body('items.*.size')
    .optional()
    .trim()
    .escape(),
  body('coupon_code')
    .optional()
    .trim()
    .escape(),
  handleValidation,
];

// --- Product validation ---
const validateProductCreation = [
  body('name_ar')
    .trim()
    .notEmpty()
    .withMessage('Arabic name is required.')
    .isLength({ max: 255 })
    .withMessage('Arabic name must be at most 255 characters.'),
  body('name_fr')
    .trim()
    .notEmpty()
    .withMessage('French name is required.')
    .isLength({ max: 255 })
    .withMessage('French name must be at most 255 characters.'),
  body('description_ar')
    .optional()
    .trim(),
  body('description_fr')
    .optional()
    .trim(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('sale_price')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a positive number.'),
  body('category_id')
    .optional({ values: 'null' })
    .trim(),
  body('colors')
    .optional()
    .isArray()
    .withMessage('Colors must be an array.'),
  body('sizes')
    .optional()
    .isArray()
    .withMessage('Sizes must be an array.'),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean.'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean.'),
  body('new_arrival')
    .optional()
    .isBoolean()
    .withMessage('New arrival must be a boolean.'),
  body('sale')
    .optional()
    .isBoolean()
    .withMessage('Sale must be a boolean.'),
  handleValidation,
];

const validateProductUpdate = [
  body('name_ar')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Arabic name must be at most 255 characters.'),
  body('name_fr')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('French name must be at most 255 characters.'),
  body('description_ar')
    .optional()
    .trim(),
  body('description_fr')
    .optional()
    .trim(),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('sale_price')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a positive number.'),
  body('category_id')
    .optional({ values: 'null' })
    .trim(),
  body('colors')
    .optional()
    .isArray()
    .withMessage('Colors must be an array.'),
  body('sizes')
    .optional()
    .isArray()
    .withMessage('Sizes must be an array.'),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean.'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean.'),
  body('new_arrival')
    .optional()
    .isBoolean()
    .withMessage('New arrival must be a boolean.'),
  body('sale')
    .optional()
    .isBoolean()
    .withMessage('Sale must be a boolean.'),
  handleValidation,
];

// --- Coupon validation ---
const validateCouponCreation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required.')
    .isLength({ max: 50 })
    .withMessage('Coupon code must be at most 50 characters.')
    .toUpperCase(),
  body('discount_type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be "percentage" or "fixed".'),
  body('discount_value')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number.'),
  body('min_order')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order must be a positive number.'),
  body('max_uses')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max uses must be a non-negative integer.'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean.'),
  body('expires_at')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Expires at must be a valid date.'),
  handleValidation,
];

const validateCouponUpdate = [
  body('code')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Coupon code must be at most 50 characters.')
    .toUpperCase(),
  body('discount_type')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be "percentage" or "fixed".'),
  body('discount_value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number.'),
  body('min_order')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order must be a positive number.'),
  body('max_uses')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max uses must be a non-negative integer.'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean.'),
  body('expires_at')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Expires at must be a valid date.'),
  handleValidation,
];

// --- Category validation ---
const validateCategoryCreation = [
  body('name_ar')
    .trim()
    .notEmpty()
    .withMessage('Arabic name is required.')
    .isLength({ max: 255 })
    .withMessage('Arabic name must be at most 255 characters.'),
  body('name_fr')
    .trim()
    .notEmpty()
    .withMessage('French name is required.')
    .isLength({ max: 255 })
    .withMessage('French name must be at most 255 characters.'),
  body('image')
    .optional()
    .trim(),
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Slug must be at most 255 characters.'),
  handleValidation,
];

const validateCategoryUpdate = [
  body('name_ar')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Arabic name must be at most 255 characters.'),
  body('name_fr')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('French name must be at most 255 characters.'),
  body('image')
    .optional()
    .trim(),
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Slug must be at most 255 characters.'),
  handleValidation,
];

// --- Order status validation ---
const validateOrderStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, shipped, delivered, cancelled.'),
  handleValidation,
];

// --- Coupon code validation (public) ---
const validateCouponCode = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required.')
    .toUpperCase(),
  body('order_total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Order total must be a positive number.'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateOrderCreation,
  validateProductCreation,
  validateProductUpdate,
  validateCouponCreation,
  validateCouponUpdate,
  validateCategoryCreation,
  validateCategoryUpdate,
  validateOrderStatus,
  validateCouponCode,
};
