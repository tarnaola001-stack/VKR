const { User } = require('../models');
const { CustomException } = require('../utils');

// ИСПРАВЛЕНО ДЛЯ ВКР: Добавлен полноценный метод редактирования данных профиля в СУБД
const updateUser = async (request, response) => {
    const { _id } = request.params;
    const { email, description, image, img } = request.body;

    try {
        const user = await User.findOne({ _id });

        if (!user) {
            throw CustomException('Пользователь не найден в системе!', 404);
        }

        // Защита: редактировать профиль может только его непосредственный владелец
        if (request.userID !== user._id.toString()) {
            throw CustomException('Доступ запрещен! Вы можете редактировать только свой профиль.', 403);
        }

        // Валидация входных данных на сервере
        if (email && !email.trim()) {
            throw CustomException('Электронная почта не может состоять из одних пробелов!', 400);
        }

        // Безопасное обновление NoSQL документа в MongoDB Atlas
        if (email) user.email = email.trim();
        if (description !== undefined) user.description = description.trim();
        
        // Сохраняем ссылки на аватарку в оба используемых в схемах поля для обратной совместимости
        if (image || img) {
            user.image = image || img;
            user.img = image || img;
        }

        await user.save();

        // Исключаем отправку хэша пароля обратно на фронтенд в целях безопасности
        const { password, ...updatedData } = user._doc;

        return response.status(200).send({
            error: false,
            message: 'Профиль успешно обновлен в базе данных!',
            user: updatedData
        });
    }
    catch ({ message, status = 500 }) {
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
    }
    catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

module.exports = {
    updateUser, // <-- ЭКСПОРТИРУЕМ НОВЫЙ МЕТОД ОБНОВЛЕНИЯ ДАННЫХ
    deleteUser
};
