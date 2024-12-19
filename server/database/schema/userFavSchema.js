const mongoose = require('mongoose');
const UserInfo =require('./userInfoSchema');
const Restaurant =require('./resturantSchema');
const FoodItem=require('./foodItemsSchema');

const userFavoritesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserInfo',
        required: true,
    },
    favoriteRestaurants: [
        {
            restaurantId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Restaurant',
                required: true,
            },
        },
    ],
    favoriteFoodItems: [
        {
            foodId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'FoodItem',
                required: true,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


userFavoritesSchema.index({userId:1});

const UserFavorites = mongoose.model('UserFavorites', userFavoritesSchema);

module.exports = UserFavorites;
