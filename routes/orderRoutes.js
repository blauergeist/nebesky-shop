const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getCheckoutSession,
} = orderController;

const { protect, isLoggedIn, restrictTo } = authController;

const router = express.Router();

router.route('/checkout-session').get(getCheckoutSession);

router
  .route('/')
  .get(restrictTo('admin'), protect, getAllOrders)
  .post(protect, createOrder);

router.route('/my-orders', protect, getMyOrders);

//router.route('/:orderId').get(getOrderById);

module.exports = router;
