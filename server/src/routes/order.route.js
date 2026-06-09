const express = require('express');
const { userMiddleware } = require('../middlewares');
// ИСПРАВЛЕНО ДЛЯ ВКР: Импортируем новый метод createOrder вместо старой Stripe-логики
const { getOrders, createOrder } = require('../controllers/order.controller');

const app = express.Router();

// Маршрут для получения списка всех заказов пользователя
app.get('/', userMiddleware, getOrders);

// ИСПРАВЛЕНО ДЛЯ ВКР: Фиксация создания оплаченного заказа в СУБД из нашего демо-шлюза
app.post('/:id', userMiddleware, createOrder);

module.exports = app;
