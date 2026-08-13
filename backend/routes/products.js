const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateAdmin } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { validateProductCreation, validateProductUpdate } = require('../middleware/validate');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.post('/', authenticateAdmin, validateProductCreation, productController.createProduct);
router.put('/:id', authenticateAdmin, validateProductUpdate, productController.updateProduct);
router.delete('/:id', authenticateAdmin, productController.deleteProduct);

// Image management (admin)
router.post(
  '/:id/images',
  authenticateAdmin,
  upload.array('images', 10),
  handleMulterError,
  productController.uploadProductImages
);
router.delete('/images/:imageId', authenticateAdmin, productController.deleteProductImage);

module.exports = router;
