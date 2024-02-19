const Cart = require('../models/cartModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// getAllCarts: Get all active carts in the system
exports.getAllCarts = factory.getAll(Cart);

// // createCart: Create a new cart for a user.
exports.initCart = catchAsync(async (req, res, next) => {
  if (req.session.cartId) return next();

  const { user } = req;
  let cart;

  // Need to refactor this, wrote it temporary for readability
  // If there is no cart for the session, but the user is logged in, check if there is an existing cart for the user
  // If there is no cart for the existing user, create a new cart and save the cart ID to the session
  // If there is no cart and the user is not logged in, create a new cart and save the cart ID to the session

  if (!req.session.cartId && user) {
    cart = await Cart.findOne({
      $and: [{ user: user.id }, { isActive: true }],
    });

    if (!cart) {
      cart = await Cart.create({ user: user.id, items: [] });
    }

    req.session.cartId = cart._id;
  } else if (!req.session.cartId && !user) {
    cart = new Cart({ items: [] });
    await cart.save();

    req.session.cartId = cart._id;
  }

  // Refactored, need to test
  // if (!req.session.cartId) {
  //   if (user) {
  //     cart = await Cart.findOne({ user: user.id, isActive: true });
  //     if (!cart) {
  //       cart = await Cart.create({ user: user.id, items: [] });
  //     }
  //   } else {
  //     cart = new Cart({ items: [] });
  //     await cart.save();
  //   }

  //   req.session.cartId = cart._id;
  // }

  next();
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
