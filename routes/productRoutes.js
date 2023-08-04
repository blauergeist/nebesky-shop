const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  deleteProduct,
  updateProduct,
} = productController;

const { protect, isLoggedIn, restrictTo } = authController;

const router = express.Router();

router.route('/').get(getAllProducts).post(createProduct);
router
  .route('/:id')
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

router.route('/category/:category').get(getProductsByCategory);

module.exports = router;
