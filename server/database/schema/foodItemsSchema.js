const mongoose = require('mongoose');
const Restaurant=require('./resturantSchema');


const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        enum: ['Starter', 'Main Course', 'Dessert', 'Beverage'], // Example categories
    },
    image: {
        type: String, // URL of the food image
        trim: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

foodItemSchema.index({name:1,price:-1});

foodItemSchema.index({ restaurantId: 1 }); // Optimized for restaurant-specific queries

// Auto-update updatedAt on save
foodItemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

module.exports = FoodItem;
