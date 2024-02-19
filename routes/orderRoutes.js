const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getCheckoutSession,
  getOrdersAfterDate,
  getTodaysOrdersActivity,
  updateOrder,
  deleteOrder,
} = orderController;

const { protect, isLoggedIn, restrictTo } = authController;

const router = express.Router();

router.route('/checkout-session').get(getCheckoutSession);

router.route('/').get(restrictTo('admin'), getAllOrders); //.post(createOrder) -> current logic creates orders in a middleware stack in viewRoutes, will be revisited once deployed due to stripe api

// need to protect the routes, currently unprotected due to development purposes
router.route('/get-after-date').get(getOrdersAfterDate);

router.route('/todays-activity').get(getTodaysOrdersActivity);

router.route('/my-orders').get(protect, getMyOrders);

// removed admin restrictions temporarily for development purposes
router
  .route('/:id')
  // .get(restrictTo('admin'), getOrderById)
  // .patch(restrictTo('admin'), updateOrder)
  // .delete(restrictTo('admin'), deleteOrder);
  .get(getOrderById)
  .patch(updateOrder)
  .delete(deleteOrder);

//router.route('/:orderId').get(getOrderById);

module.exports = router;
