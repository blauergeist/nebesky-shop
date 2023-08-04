const mongoose = require('mongoose');
const Cart = require('./cartModel');
const AppError = require('../utils/appError');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

cartItemSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'product',
    select: 'name description price imageUrl',
  });
  next();
});

// cartItemSchema.pre('save', function (next) {
//   // Your pre-save logic here
//   // For example, you can modify some fields before saving the document.
//   // The 'this' context points to the document being saved.

//   this.populate({
//     path: 'product',
//     select: 'name description imageUrl',
//   });
//   // Call 'next()' to proceed with the saving process
//   next();
// });

// Static method to handle updating the quantity of an existing cart item
// cartItemSchema.statics.updateQuantity = async function (productId, quantity) {
//   const existingCartItem = await this.findOne({
//     product: productId,
//     isActive: true,
//   });
//   if (existingCartItem) {
//     existingCartItem.quantity += parseFloat(quantity);
//     await existingCartItem.save(); // Save the changes to the existing cart item
//     return existingCartItem;
//   }
//   return null; // No existing cartItem found with a matching productId;
// };

cartItemSchema.statics.addItemToCart = async function (
  cartId,
  productId,
  quantity
) {
  // Find the cart associated with the cartId in the session
  const cart = await Cart.findById(cartId);

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Find the cart item with matching productId and associated cartId
  const existingCartItem = cart.items.find((item) =>
    item.product.equals(productId)
  );

  if (existingCartItem) {
    // If the cart item exists for the current cart, update its quantity
    existingCartItem.quantity += parseFloat(quantity);
    await existingCartItem.save(); // Save the changes to the cart
    return existingCartItem;
  }

  // If the cart item doesn't exist for the current cart, create a new one

  const newCartItem = await CartItem.create({ product: productId, quantity });
  cart.items.push(newCartItem);
  await cart.save();
  return newCartItem;
};

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
