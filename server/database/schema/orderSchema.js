const mongoose = require('mongoose');
const UserInfo = require('./userInfoSchema');
const FoodItem = require('./foodItemsSchema');
const Restaurant=require('./resturantSchema');


const userOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserInfo',
        required: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    foodItems: [
        {
            foodId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'FoodItem',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Preparing', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    orderedAt: {
        type: Date,
        default: Date.now,
    },
});

userOrderSchema.index({userId:1,orderedAt: -1})

const UserOrder = mongoose.model('UserOrder', userOrderSchema);

module.exports = UserOrder;
