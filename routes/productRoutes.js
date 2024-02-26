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

router.route('/').get(getAllProducts).post(restrictTo('admin'), createProduct);
router
  .route('/:id')
  .get(getProductById)
  .patch(restrictTo('admin'), updateProduct)
  .delete(restrictTo('admin'), deleteProduct);

router.route('/category/:categoryId').get(getProductsByCategory);

module.exports = router;
