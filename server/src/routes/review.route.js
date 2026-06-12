const express = require('express');
const { userMiddleware } = require('../middlewares');
const { createReview, getReviews } = require('../controllers/review.controller');

const app = express.Router();

// Оставить отзыв может только авторизованный пользователь
app.post('/', userMiddleware, createReview);

// Просматривать отзывы к услуге могут все посетители сайта
app.get('/:gigID', getReviews);

module.exports = app;
