const { User } = require('../models');
const { CustomException } = require('../utils');
const jwt = require('jsonwebtoken'); // Убедитесь, что эта строка есть вверху файла

const getUser = async (request, response) => {
  const { _id } = request.params;
  try {
    // Безопасный поиск по первичному ID записи
    const user = await User.findById(_id);
    if (!user) {
      return response.status(404).send({ 
        error: true, 
        message: "Пользователь не найден!" 
      });
    }
    
    // В целях безопасности полностью исключаем хэш пароля из ответа фронтенду
    const { password, ...userData } = user._doc;
    return response.status(200).send(userData);
  } catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message
    });
  }
};

const updateUser = async (request, response) => {
  const { _id } = request.params;
  const { email, description, image, img, isSeller } = request.body;
  try {
    const user = await User.findOne({ _id });
    if (!user) {
      throw CustomException('Пользователь не найден в системе!', 404);
    }
    if (request.userID !== user._id.toString()) {
      throw CustomException('Доступ запрещен! Вы можете редактировать только свой профиль.', 403);
    }
    if (email && !email.trim()) {
      throw CustomException('Электронная почта не может состоять из одних пробелов!', 400);
    }
    if (email) user.email = email.trim();
    if (description !== undefined) user.description = description.trim();
    if (image || img) {
      user.image = image || img;
      user.img = image || img;
    }
    
    if (isSeller !== undefined) {
      user.isSeller = isSeller;
    }

    await user.save();
    const { password, ...updatedData } = user._doc;

    // ИСПРАВЛЕНО ДЛЯ ВКР: Перезаписываем JWT токен в сессии, чтобы обновить роль isSeller на сервере без перезахода
    const secretKey = process.env.JWT_KEY || "secret"; // Замените на вашу переменную секретного ключа из auth.controller
    const token = jwt.sign(
      { _id: user._id, isSeller: user.isSeller },
      secretKey,
      { expiresIn: '24h' }
    );

    // Обновляем куку авторизации новыми данными
    response.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return response.status(200).send({
      error: false,
      message: 'Профиль успешно обновлен в базе данных и токен обновлен!',
      user: updatedData
    });
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message
    });
  }
};

const deleteUser = async (request, response) => {
  const { _id } = request.params;
  try {
    const user = await User.findOne({ _id });
    if (!user) {
      throw CustomException('Пользователь не найден!', 404);
    }
    if (request.userID === user._id.toString()) {
      await User.deleteOne({ _id });
      return response.send({
        error: false,
        message: 'Account successfully deleted!'
      });
    }
    throw CustomException('Invalid request!. Cannot delete other user accounts.', 403);
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message
    });
  }
};

module.exports = {
  getUser,
  updateUser,
  deleteUser
};
