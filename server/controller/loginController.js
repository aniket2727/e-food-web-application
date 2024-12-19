const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const EventEmitter = require('events');
const UserInfo = require('../database/schema/userInfoSchema');
const UserFavorites = require('../database/schema/userFavSchema');
const Restaurant = require('../database/schema/resturantSchema');
const FoodItem = require('../database/schema/foodItemsSchema');

const redis = require('@redis/client');
const { createClient } = redis;

let redisClient;

// Function to connect to Redis
const connectToRedis = async () => {
  if (!redisClient) {
    redisClient = createClient();

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    redisClient.on('end', () => {
      console.log('Redis connection closed');
    });

    try {
      await redisClient.connect(); // Connect to Redis server
    } catch (error) {
      console.error('Error connecting to Redis:', error);
    }
  }
};

// Function to close Redis connection
const closeRedisConnection = () => {
  if (redisClient) {
    redisClient.quit(); // Gracefully close the Redis client
  }
};

// Helper function to get user favorites from cache or database
const getFavorites = async (userId) => {
  const cacheKey = `favorites:${userId}`;

  try {
    // Ensure Redis client is connected
    if (!redisClient || !redisClient.isOpen) {
      console.log('Redis client not connected, reconnecting...');
      await connectToRedis(); // Reconnect if necessary
    }

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Cache hit');
      return JSON.parse(cachedData); // Return cached data
    }

    console.log('Cache miss, fetching from database');
    // Fetch from database
    const userFavorites = await UserFavorites.findOne({ userId })
      .populate({
        path: 'favoriteRestaurants.restaurantId',
        model: Restaurant,
        select: 'name address contact cuisines rating',
      })
      .populate({
        path: 'favoriteFoodItems.foodId',
        model: FoodItem,
        select: 'name description price category image',
      })
      .exec();

    const favoriteData = userFavorites
      ? {
          favoriteRestaurants: userFavorites.favoriteRestaurants.map((fav) => fav.restaurantId),
          favoriteFoodItems: userFavorites.favoriteFoodItems.map((fav) => fav.foodId),
        }
      : { favoriteRestaurants: [], favoriteFoodItems: [] };

    // Update cache with the fetched data
    await redisClient.set(cacheKey, JSON.stringify(favoriteData));
    return favoriteData;
  } catch (error) {
    console.error('Error in getFavorites:', error);
    throw error;
  }
};

// Login Controller
const loginUser = async (req, res, next) => {
  try {
    // Validation
    await body('email').isEmail().withMessage('Please enter a valid email').run(req);
    await body('password').notEmpty().withMessage('Password is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input data', errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await UserInfo.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Fetch Favorites (from cache or DB)
    const favorites = await getFavorites(user._id);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
      favorites,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  loginUser,
  connectToRedis,
  closeRedisConnection,
};
