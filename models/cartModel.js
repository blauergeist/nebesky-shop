const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartItem',
      },
    ],
    isActive: {
      type: Boolean,
      default: true, // Set the default value to true (active) when creating a new cart
    },
  },
  {
    // Use the 'select' property to exclude the 'isActive' field from query results
    toJSON: { virtuals: true, versionKey: false, select: '-isActive' },
    toObject: { virtuals: true, versionKey: false, select: '-isActive' },
  }
);

// Virtual populate
// cartSchema.virtual('items', {
//   ref: 'CartItem', // Reference the CartItem model
//   localField: '_id', // The field to match in the CartItem model
//   foreignField: 'cart', // The field in the CartItem model that matches with this cart's _id
//   justOne: false, // Set to false to get an array of items
// });

cartSchema.pre(/^find/, function (next) {
  this.populate('items');
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
