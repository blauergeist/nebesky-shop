const express = require('express');
const cartItemController = require('../controllers/cartItemController');
const authController = require('../controllers/authController');

const { createCartItem, getCartItemById, updateCartItem, deleteCartItem } =
  cartItemController;

const { protect, isLoggedIn, restrictTo } = authController;

const router = express.Router();

router.route('/').post(createCartItem);

router
  .route('/:cartItemId')
  .get(getCartItemById)
  .patch(updateCartItem)
  .delete(deleteCartItem);

module.exports = router;
