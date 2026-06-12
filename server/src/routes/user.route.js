const express = require('express');
const { userMiddleware } = require('../middlewares');
const { deleteUser, updateUser, getUser } = require('../controllers/user.controller'); 

const app = express.Router();

// Открытый маршрут для получения данных специалиста (нужен для карточек в каталоге)
app.get('/:_id', getUser);

// Маршруты для обработки запросов на редактирование и удаление личного кабинета
app.put('/:_id', userMiddleware, updateUser);
app.delete('/:_id', userMiddleware, deleteUser);

module.exports = app;
