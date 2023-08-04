const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Get all products
exports.getAllProducts = factory.getAll(Product);

// Get a single product by ID
exports.getProductById = factory.getOne(Product, { path: 'category reviews' });

// Get products by category
exports.getProductsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await Product.find({ category: categoryId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ status: 'fail', error: 'Internal server error' });
  }
});

// Create a product
exports.createProduct = factory.createOne(Product);

// Update a product
exports.updateProduct = factory.updateOne(Product);

// Delete a product
exports.deleteProduct = factory.deleteOne(Product);
