const Cart = require('../models/cartModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// getAllCarts: Get all active carts in the system
exports.getAllCarts = factory.getAll(Cart);

// // createCart: Create a new cart for a user.
exports.initCart = catchAsync(async (req, res, next) => {
  const { user } = req;
  // console.log(user);
  let cart;

  // need to refactor this, wrote it temporary for readibility
  if (!req.session.cartId && user) {
    cart = await Cart.findOne({
      $and: [{ user: user.id }, { isActive: true }],
    });

    if (!cart) {
      cart = await Cart.create({ user: user.id, items: [] });
    }

    req.session.cartId = cart._id;
    return res.status(200).json(cart);
  } else if (!req.session.cartId && !user) {
    cart = new Cart({ items: [] });

    await cart.save();
    req.session.cartId = cart._id;

    return res.status(200).json(cart);
  }

  cart = await Cart.findById(req.session.cartId);

  res.status(200).json(cart);
});

// getCartById: Retrieve a user's cart by its ID.
exports.getCartById = catchAsync(async (req, res, next) => {
  const cart = await Cart.findById(req.params.cartId);
  console.log('testerino', cart);
  res.status(200).render('cart', {
    title: 'All Products',
    cart,
  });
});

// updateCart: Update the cart, e.g., adding or removing cart items, updating quantities.
exports.updateCart = factory.updateOne(Cart);

// deleteCart: Delete a user's cart.
exports.deleteCart = factory.deleteOne(Cart);
