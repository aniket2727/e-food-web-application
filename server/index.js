const express = require('express');
const connectDB = require('./database/config');
const dotenv = require('dotenv');
const userRoutes = require('./routes/authRoute');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const cors = require('cors');
const { connectToRedis, closeRedisConnection } = require('./controller/loginController');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all origins (you can restrict this to specific domains)
app.use(cors()); // By default, this allows all origins

// Connect to the database
connectDB();

// Apply middleware
app.use(express.json()); // Make sure this is before the routes


// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

// Apply rate-limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later',
});

// Routes
app.use('/api/users', limiter, userRoutes); // Apply rate-limiting to the user routes''

// Gracefully close Redis on server shutdown
process.on('SIGINT', () => {
  closeRedisConnection();
  process.exit(0);
});


app.use(errorHandler); // Custom error handler (if you want to have more specific error handling)

// Error-handling middleware for logging errors (log to console and file)
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}, Stack: ${err.stack}`);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Error handler middleware (custom handler, placed at the end)
//app.use(errorHandler); // Custom error handler (if you want to have more specific error handling)

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
