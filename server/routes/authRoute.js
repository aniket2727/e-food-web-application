const express = require('express');
const { registerUser } = require('../controller/authController');
const router = express.Router();

// @route   POST /api/users/register
router.post('/register', registerUser);

module.exports = router;
