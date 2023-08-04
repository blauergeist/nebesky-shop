const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide product quantity available'],
      default: 0,
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide a product image'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be above 5'],
      set: (value) => Math.round(value * 10) / 10, // .round rounds a value to the closest integer (for example 4.7777 would be rounded to 5) and to avoid this I used the trick to multiply and divide by 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.pre('save', function (next) {
  //"this" here refers to the document being processed
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
