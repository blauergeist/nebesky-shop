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
  .post(createCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

module.exports = router;
