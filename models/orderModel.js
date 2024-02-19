const mongoose = require('mongoose');
const validator = require('validator');
const Product = require('./productModel'); // Import the Product model
const slugify = require('slugify');

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
      productName: String, // Added field to store the product name
    },
  ],
  paymentStatus: {
    type: String,
    required: true,
  },
  fulfilled: {
    type: Boolean,
    default: false,
  },
  fulfillmentDate: {
    type: Date,
    default: null,
  },
});

// Populate the product field to get the product object and then extract productName
orderSchema.pre('find', function (next) {
  this.populate({
    path: 'items.product',
    model: Product,
    select: 'name', // Select only the 'name' field from the Product model
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
