const CartItem = require('../models/cartItemModel');
const catchAsync = require('../utils/catchAsync');
const Cart = require('../models/cartModel');
const factory = require('./handlerFactory');

// exports.createCartItem = factory.createOne(Cart);

exports.createCartItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { cartId } = req.session;

  console.log(req.session);

  // const cart = await Cart.findById(cartId);
  // if (!cart) {
  //   return res.status(404).json({ error: 'Cart not found' });
  // }

  // This is the code to create a single cartItem for every product and just update the quantity

  // if a cartItem with product ID already exists, add existing quantity with incoming quantity
  // const existingCartItem = await CartItem.findOne({ product: productId });
  // if (existingCartItem) {
  //   existingCartItem.quantity += parseFloat(req.body.quantity);
  //   await existingCartItem.save();
  //   const oldCartItem = cart.items.find((item) => {
  //     item.toString() === existingCartItem.id;
  //   });
  //   if (oldCartItem) oldCartItem.quantity = existingCartItem.quantity;
  //   await cart.save();
  //   return res.status(200).json(existingCartItem);
  // }

  // const cartItem = await CartItem.create({ product: productId, quantity });
  // cart.items.push(cartItem);
  // await cart.save();

  // res.status(200).json(cartItem);

  // this worked but has issues -----------when order is created, next cart is not filled with newly created cartItems
  // Use the static method to handle existingCartItem functionality
  // const existingCartItem = await CartItem.updateQuantity(productId, quantity);
  // if (existingCartItem === null) {
  //   // If no existing cart item found, create a new cart item
  //   const cartItem = await CartItem.create({ product: productId, quantity });
  //   cart.items.push(cartItem);
  //   await cart.save();
  //   return res.status(200).json(cartItem);
  // }

  // // If existing cart item found, update the cart item's quantity
  // const oldCartItem = cart.items.find(
  //   (item) => item.toString() === existingCartItem.id
  // );
  // if (oldCartItem) oldCartItem.quantity = existingCartItem.quantity;
  // await cart.save();

  const cartItem = await CartItem.addItemToCart(cartId, productId, quantity);
  return res.status(200).json(cartItem);
});

exports.getCartItemById = factory.getOne(CartItem);

exports.updateCartItem = factory.updateOne(CartItem);

exports.deleteCartItem = factory.deleteOne(CartItem);
