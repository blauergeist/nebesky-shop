const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = reviewController;

const { protect, restrictTo } = authController;

const router = express.Router();

router
  .route('/')
  .get(restrictTo('admin'), getAllReviews)
  .post(protect, restrictTo('user'), createReview);

// task - verify review routers and auth
router
  .route('/:id')
  .get(getReviewById)
  .patch(protect, updateReview)
  .delete(deleteReview);

module.exports = router;
