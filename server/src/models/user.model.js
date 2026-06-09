const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
        default: "/media/noavatar.png" // Локальная заглушка по умолчанию
    },
    country: {
        type: String,
        required: true,
        default: "Russia"
    },
    phone: {
        type: String,
        required: false, // Отключено, чтобы обычный пользователь мог зарегистрироваться
        default: ""
    },
    description: {
        type: String,
        required: false, // Отключено, чтобы обычный пользователь мог зарегистрироваться
        default: ""
    },
    isSeller: {
        type: Boolean,
        default: false,
        required: false,
    }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);