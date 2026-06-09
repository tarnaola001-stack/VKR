const express = require('express');
const { userMiddleware } = require('../middlewares');
const { createReview, getReviews } = require('../controllers/review.controller');

const app = express.Router();

// Маршрут для создания нового отзыва (доступен только авторизованным клиентам)
app.post('/', userMiddleware, createReview);

// Маршрут для получения отзывов к конкретной услуге (id)
app.get('/:id', getReviews);

// ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 7): Маршрут для получения сквозных отзывов исполнителя из каталога
app.get('/', getReviews);

module.exports = app;
