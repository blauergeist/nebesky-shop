const express = require('express');
const {
  getLoginForm,
  getAccount,
  updateUserData,
  getProductOverview,
  getProduct,
  getCurrentCart,
} = require('../controllers/viewsController');
const { protect, isLoggedIn } = require('../controllers/authController');
const { createOrder } = require('../controllers/orderController');

const router = express.Router();

router.use(isLoggedIn);

router.get('/', createOrder, isLoggedIn, getProductOverview);

router.get('/login', isLoggedIn, getLoginForm);

router.get('/cart', getCurrentCart);

router.get('/me', protect, getAccount);

router.post('/submit-user-data', protect, updateUserData);

router.get('/product/:slug', isLoggedIn, getProduct);

module.exports = router;
