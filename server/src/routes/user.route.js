const express = require('express');
const { userMiddleware } = require('../middlewares');
const { deleteUser, updateUser } = require('../controllers/user.controller'); // ИСПРАВЛЕНО ДЛЯ ВКР: Импортируем updateUser

const app = express.Router();

// ИСПРАВЛЕНО ДЛЯ ВКР: Маршрут для обработки запросов на редактирование данных личного кабинета
app.put('/:_id', userMiddleware, updateUser);

app.delete('/:_id', userMiddleware, deleteUser);

module.exports = app;
