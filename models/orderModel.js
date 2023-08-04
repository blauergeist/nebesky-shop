const mongoose = require('mongoose');
const validator = require('validator');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  contactEmail: {
    type: String,
    required: false,
    validate: {
      validator: (value) => {
        // The built-in email validator from Mongoose
        return validator.isEmail(value);
      },
      message: 'Invalid email format for guest email.',
    },
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  totalPrice: {
    type: Number,
    required: true,
    // set: (value) => Math.round(value * 100) / 100,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  paymentStatus: {
    type: String,
    required: true,
  },
  fulfilled: {
    type: String,
    default: 'No',
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
