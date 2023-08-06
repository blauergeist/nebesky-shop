const express = require('express');
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');

const { getAllCategories, createCategory, updateCategory, deleteCategory } =
  categoryController;

const { protect, isLoggedIn, restrictTo } = authController;

const router = express.Router();

router
  .route('/')
  .get(getAllCategories)
  .post(restrictTo('admin'), createCategory)
  .patch(restrictTo('admin'), updateCategory)
  .delete(restrictTo('admin'), deleteCategory);

module.exports = router;
