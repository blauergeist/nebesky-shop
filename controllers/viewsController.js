const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

exports.getProductOverview = catchAsync(async (req, res, next) => {
  // 1. Get tour data from collection
  const products = await Product.find();

  // 2. Render the template using tour data from step 1
  res.status(200).render('overview', {
    title: 'All Products',
    products,
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  // 1. Get data for the requested product, including reviews and guides
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // 2. Render template using Product data
  res.status(200).render('product', {
    title: product.name,
    product,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getCurrentCart = catchAsync(async (req, res) => {
  const cart = await Cart.findById(req.session.cartId);
  res.status(200).render('cart', {
    title: 'Your cart',
    cart,
  });
});
