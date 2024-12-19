const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Index will be created automatically
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true, // Index will be created automatically
        minlength: 10,
        maxlength: 15,
    },
    address: {
        type: String,
        trim: true,
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

// Optional: Index for name if frequent name-based search is needed
userInfoSchema.index({ name: 1 });

const UserInfo = mongoose.model('UserInfo', userInfoSchema);

module.exports = UserInfo;
