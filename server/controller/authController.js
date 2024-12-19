const UserInfo = require('../database/schema/userInfoSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');

// Register User Controller
const registerUser = asyncHandler(async (req, res, next) => {

  // Validation checks
  await body('email').isEmail().withMessage('Please enter a valid email').run(req);
  await body('phone').isMobilePhone().withMessage('Please enter a valid phone number').run(req);
  await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Invalid input data');
    error.statusCode = 400;
    error.errors = errors.array();
    return next(error); // Use next to pass the error to the error handler
  }

  const { name, email, password, phone, address } = req.body;

  // Validate input
  if (!name || !email || !password || !phone) {
    const error = new Error('All required fields must be provided.');
    error.statusCode = 400;
    return next(error); // Use next to pass the error to the error handler
  }

  // Check if user exists using indexed fields (email or phone)
  const existingUser = await UserInfo.findOne({
    $or: [{ email }, { phone }],
  }).exec();

  if (existingUser) {
    // Send a clear error message if the user already exists
    const error = new Error('User with this email or phone already exists.');
    error.statusCode = 400;
    return next(error); // Use next to pass the error to the error handler
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await UserInfo.create({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
  });

  // Generate JWT token
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  // Respond with user data and token
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
    },
    token,
  });
});

module.exports = { registerUser };
