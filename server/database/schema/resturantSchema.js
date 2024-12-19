const mongoose = require('mongoose');
const FoodItem =require('./foodItemsSchema');


const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    contact: {
        phone: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 15,
        },
        email: {
            type: String,
            required: true,
            match: [/.+@.+\..+/, 'Please enter a valid email address'],
        },
    },
    cuisines: {
        type: [String], // Example: ['Indian', 'Chinese', 'Italian']
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    menu: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodItem', // Reference to food items offered by the restaurant
        },
    ],
    isOpen: {
        type: Boolean,
        default: true,
    },
    openingHours: {
        start: { type: String, required: true }, // Example: '09:00 AM'
        end: { type: String, required: true }, // Example: '11:00 PM'
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


restaurantSchema.index({name:1});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
