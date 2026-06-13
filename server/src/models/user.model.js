const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Имя пользователя обязательно для заполнения!'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email обязателен для заполнения!'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен для заполнения!'],
  },
  image: {
    type: String,
    required: false,
    default: "/media/noavatar.png" 
  },
  country: {
    type: String,
    required: true,
    default: "Russia"
  },
  phone: {
    type: String,
    required: false, 
    default: ""
  },
  description: {
    type: String,
    required: false, 
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
