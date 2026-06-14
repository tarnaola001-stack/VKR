const { User } = require('../models');
const { CustomException } = require('../utils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { JWT_SECRET, NODE_ENV } = process.env;

const saltRounds = 10;

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
};

const getCookieConfig = () => ({
  httpOnly: true,
  sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
  secure: NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7 * 1000,
  path: '/',
});

const getClearCookieConfig = () => ({
  httpOnly: true,
  sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
  secure: NODE_ENV === 'production',
  path: '/',
});

const authRegister = async (request, response) => {
  const {
    username,
    email,
    phone,
    password,
    image,
    isSeller,
    description,
  } = request.body;

  try {
    if (!username || !username.trim()) {
      return response.status(400).send({
        error: true,
        message: 'Имя пользователя обязательно для заполнения!',
      });
    }

    if (!email || !email.trim()) {
      return response.status(400).send({
        error: true,
        message: 'Email обязателен для заполнения!',
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return response.status(400).send({
        error: true,
        message: 'Введите корректный Email. Например: student@yandex.com',
      });
    }

    if (!password) {
      return response.status(400).send({
        error: true,
        message: 'Пароль обязателен для заполнения!',
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return response.status(400).send({
        error: true,
        message: 'Этот логин или Email уже заняты! Выберите другое имя или почту.',
      });
    }

    const hash = bcrypt.hashSync(password, saltRounds);

    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hash,
      image: image || '/media/noavatar.png',
      country: 'Russia',
      description: description || '',
      isSeller: isSeller === true || isSeller === 'true',
      phone: phone || '',
    });

    await user.save();

    return response.status(201).send({
      error: false,
      message: 'Пользователь успешно зарегистрирован!',
    });
  } catch (error) {
    console.log('Полный лог ошибки на сервере:', error);

    if (error.message && error.message.includes('E11000')) {
      return response.status(400).send({
        error: true,
        message: 'Этот логин или Email уже заняты! Выберите другое имя или почту.',
      });
    }

    return response.status(500).send({
      error: true,
      message: 'Ошибка при сохранении пользователя в базу данных!',
    });
  }
};

const authLogin = async (request, response) => {
  const { username, password } = request.body;

  try {
    if (!JWT_SECRET) {
      throw CustomException('JWT_SECRET не задан в переменных окружения сервера!', 500);
    }

    if (!username || !password) {
      return response.status(400).send({
        error: true,
        message: 'Введите имя пользователя и пароль!',
      });
    }

    const user = await User.findOne({ username: username.trim() });

    if (!user) {
      return response.status(404).send({
        error: true,
        message: 'Неверное имя пользователя или пароль!',
      });
    }

    const match = bcrypt.compareSync(password, user.password);

    if (match) {
      const { password, ...data } = user._doc;

      const token = jwt.sign(
        { _id: user._id, isSeller: user.isSeller },
        JWT_SECRET,
        { expiresIn: '7 days' }
      );

      return response
        .cookie('accessToken', token, getCookieConfig())
        .status(202)
        .send({
          error: false,
          message: 'Успешный вход!',
          user: data,
        });
    }

    return response.status(400).send({
      error: true,
      message: 'Неверное имя пользователя или пароль!',
    });
  } catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || 'Внутренняя ошибка сервера при авторизации',
    });
  }
};

const authLogout = async (request, response) => {
  return response
    .clearCookie('accessToken', getClearCookieConfig())
    .send({
      error: false,
      message: 'Сессия завершена успешно!',
    });
};

const authStatus = async (request, response) => {
  try {
    const targetID = request.user?._id || request.userID;

    const user = await User.findOne({ _id: targetID }).select('-password');

    if (!user) {
      return response.status(404).send({
        error: true,
        message: 'Пользователь не найден!',
      });
    }

    return response.send({
      error: false,
      message: 'Успешно!',
      user,
    });
  } catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || 'Ошибка проверки статуса авторизации',
    });
  }
};

module.exports = {
  authLogin,
  authLogout,
  authRegister,
  authStatus,
};