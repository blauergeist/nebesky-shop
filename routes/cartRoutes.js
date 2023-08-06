const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const { getAllCarts, initCart, getCartById, updateCart, deleteCart } =
  cartController;

const { protect, isLoggedIn, restrictTo } = authController;

const router = express.Router();

router.route('/allCarts').get(restrictTo('admin'), getAllCarts);

router.route('/test-session').get((req, res, next) => {
  req.session.testValue = 'This is a session test value';
  res.send('Session test value set successfully');
});

router.route('/:cartId').get(getCartById).patch(updateCart).delete(deleteCart);

module.exports = router;
