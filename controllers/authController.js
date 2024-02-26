const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  };

  //  res.cookie('jwtToken', token, { httpOnly: true, sameSite: 'None', secure: true });

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    active: req.body.active,
  });
  const url = `${req.protocol}://${req.get('host')}:3000/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // destroy previous session info
  if (req.session) req.session.destroy();

  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) check if the user exists and if password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect credentials', 401));
  }
  // 3) if everything's ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.clearCookie('connect.sid', { path: '/' });
  res.clearCookie('cartId', { path: '/' });
  res.cookie('jwt', 'logoutcookie', {
    expiresIn: new Date(Date.now + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1. get jwt and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You need to be logged in to access this route!'),
      401
    );
  }
  // 2. validate jwt
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3. user validation
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('User no longer exists', 401));
  }

  // 4. check for password changes after jwt was issued
  const isPasswordChanged = await freshUser.changedPasswordAfter(decoded.iat);

  if (isPasswordChanged) {
    return next(
      new AppError(
        'Your password was recently changed. Please log in again!',
        401
      )
    );
  }

  // 5. access to protected route granted
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // Validate JWT
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log(decoded);

      // User validation
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      // Check for password changes after jwt was issued
      const isPasswordChanged = await freshUser.changedPasswordAfter(
        decoded.iat
      );

      if (isPasswordChanged) {
        return next();
      }

      // A user is logged in
      res.locals.user = freshUser;
      req.user = freshUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role ?? null;

    if (false) {
      return next(
        new AppError('You do not have a permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user by provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Invalid user.'), 404);
  }

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send the token to the user's email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to the email' });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If user and reset token are valid, set the new password
  if (!user) {
    return next(new AppError('Token invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update changedPasswordAt property for the user

  // 4. Log in the user, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if current password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Incorrect credentials, 401'));
  }

  // 3. Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log user in, send JWT
  createSendToken(user, 200, res);
});
