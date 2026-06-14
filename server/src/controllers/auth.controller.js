const { User } = require('../models');
const { CustomException } = require('../utils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, NODE_ENV } = process.env;
const saltRounds = 10;

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
};

const authRegister = async (request, response) => {
  const { username, email, phone, password, image, isSeller, description } = request.body;
  
  try {
    if (!username) {
      return response.status(400).send({
        error: true,
        message: 'Имя пользователя обязательно для заполнения!'
      });
    }
    if (!email) {
      return response.status(400).send({
        error: true,
        message: 'Email обязателен для заполнения!'
      });
    if (!isValidEmail(normalizedEmail)) {
        return response.status(400).send({
        error: true,
        message: 'Введите корректный Email. Например: student@yandex.com',
    }); 
    }
    }
    if (!password) {
      return response.status(400).send({
        error: true,
        message: 'Пароль обязателен для заполнения!'
      });
    }

    // Хешируем пароль пользователя перед сохранением в базу
    const hash = bcrypt.hashSync(password, saltRounds);

    // ИСПРАВЛЕНО ДЛЯ ВКР: Безопасное приведение типов данных и русификация
    const user = new User({
      username: username,
      email: normalizedEmail,
      password: hash,
      image: image || "/media/noavatar.png", 
      country: "Russia", 
      description: description || "", 
      isSeller: isSeller === true || isSeller === 'true' ? true : false, 
      phone: phone || "" 
    });

    await user.save();
    return response.status(201).send({
      error: false,
      message: 'Пользователь успешно зарегистрирован!'
    });
  }
  catch (error) {
    console.log("Полный лог ошибки на сервере:", error); 
    
    if (error.message && error.message.includes('E11000')) {
      return response.status(400).send({
        error: true,
        message: 'Этот логин или Email уже заняты! Выберите другое имя.'
      });
    }
    return response.status(500).send({
      error: true,
      message: 'Ошибка при сохранении пользователя в базу данных!'
    });
  }
};

const authLogin = async (request, response) => {
  const { username, password } = request.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return response.status(404).send({ error: true, message: 'Неверное имя пользователя или пароль!' });
    }
    const match = bcrypt.compareSync(password, user.password);
    if (match) {
      const { password, ...data } = user._doc;
      const token = jwt.sign({
        _id: user._id,
        isSeller: user.isSeller
      }, JWT_SECRET, { expiresIn: '7 days' });

      const cookieConfig = {
        httpOnly: true,
        sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
        secure: NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 * 1000, 
        path: '/'
      };
      return response.cookie('accessToken', token, cookieConfig)
        .status(202).send({
          error: false,
          message: 'Успешный вход!',
          user: data
        });
    }
    return response.status(400).send({ error: true, message: 'Неверное имя пользователя или пароль!' });
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || 'Внутренняя ошибка сервера при авторизации'
    });
  }
};

const authLogout = async (request, response) => {
  const cookieConfig = {
    httpOnly: true,
    sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
    secure: NODE_ENV === 'production',
    path: '/'
  };
  return response.clearCookie('accessToken', cookieConfig)
    .send({
      error: false,
      message: 'Сессия завершена успешно!'
    });
};

const authStatus = async (request, response) => {
  try {
    const targetID = request.user?._id || request.userID;
    const user = await User.findOne({ _id: targetID }).select('-password');
    if (!user) {
      return response.status(404).send({ error: true, message: 'Пользователь не найден!' });
    }
    return response.send({
      error: false,
      message: 'Успешно!',
      user
    });
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || 'Ошибка проверки статуса авторизации'
    });
  }
};

module.exports = {
  authLogin,
  authLogout,
  authRegister,
  authStatus
};
