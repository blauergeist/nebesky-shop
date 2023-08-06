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

router.route('/').get(restrictTo('admin'), getAllOrders); //.post(createOrder) -> current logic creates orders in a middleware stack in viewRoutes, will be revisited once deployed due to stripe api

router.route('/my-orders').get(protect, getMyOrders);

//router.route('/:orderId').get(getOrderById);

module.exports = router;
