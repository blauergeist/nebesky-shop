const express = require('express');

const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateCurrentUser,
  deleteCurrentUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');

const {
  protect,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} = require('../controllers/authController');

const router = express.Router();

// Authentication
router.post('/signup', signup);

router.post('/login', login);

router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);

router.patch('/resetPassword/:token', resetPassword);

router.use(protect); // Protects all routes coming after this line

router.patch('/updatePassword', updatePassword);

router.get('/me', getMe, getUserById);

router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateCurrentUser);

router.delete('/deleteMe', deleteCurrentUser);

router.use(restrictTo('admin')); // Requires admin role after this line

// Getting user(s)
router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;
