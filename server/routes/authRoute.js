const express = require('express');
const { registerUser } = require('../controller/authController');
const { loginUser }=require('../controller/loginController')
const router = express.Router();

// @route   POST /api/users/register
router.post('/register', registerUser);
router.post('/login',loginUser);

module.exports = router;
