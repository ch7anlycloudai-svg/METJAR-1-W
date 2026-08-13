const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateAdmin } = require('../middleware/auth');
const { validateCategoryCreation, validateCategoryUpdate } = require('../middleware/validate');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Admin routes
router.post('/', authenticateAdmin, validateCategoryCreation, categoryController.createCategory);
router.put('/:id', authenticateAdmin, validateCategoryUpdate, categoryController.updateCategory);
router.delete('/:id', authenticateAdmin, categoryController.deleteCategory);

module.exports = router;
