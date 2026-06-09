const { User } = require('../models');
const { CustomException } = require('../utils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const satelize = require('satelize');
const { JWT_SECRET, NODE_ENV } = process.env;
const saltRounds = 10;

const authRegister = async (request, response) => {
    const { username, email, phone, password, image, isSeller, description } = request.body;
    try {
        if (!password) {
            return response.status(400).send({
                error: true,
                message: 'Пароль обязателен для заполнения!'
            });
        }

        // Хешируем пароль пользователя перед сохранением в базу
        const hash = bcrypt.hashSync(password, saltRounds);

        // ИСПРАВЛЕНО ДЛЯ ВКР: Безопасное приведение типов данных для защиты записи обычного пользователя в MongoDB Atlas
        const user = new User({
            username: username,
            email: email,
            password: hash,
            image: image || "/media/noavatar.png", // Безопасная подстановка аватарки
            country: "Russia", // Фиксируем страну по умолчанию для вашей ВКР
            description: description || "", // Защита от пустых значений для не-исполнителей
            isSeller: isSeller === true || isSeller === 'true' ? true : false, // Строгое приведение к логическому типу
            phone: phone || "" // Защита от пустых значений для не-исполнителей
        });

        await user.save();

        return response.status(201).send({
            error: false,
            message: 'New user created!'
        });
    }
    catch (error) {
        console.log("Полный лог ошибки на сервере:", error); // Выводим реальный лог в консоль VS Code
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
            throw CustomException('Check username or password!', 404);
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
                maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
                path: '/'
            };

            return response.cookie('accessToken', token, cookieConfig)
                .status(202).send({
                    error: false,
                    message: 'Success!',
                    user: data
                });
        }
        throw CustomException('Check username or password!', 404);
    }
    catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

const authLogout = async (request, response) => {
    // ИСПРАВЛЕНО ДЛЯ ВКР: Параметры очистки куки приведены в полное соответствие с конфигурацией авторизации
    const cookieConfig = {
        httpOnly: true,
        sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
        secure: NODE_ENV === 'production',
        path: '/'
    };

    return response.clearCookie('accessToken', cookieConfig)
        .send({
            error: false,
            message: 'User have been logged out!'
        });
};

const authStatus = async (request, response) => {
    try {
        // Безопасное чтение ID пользователя из токена авторизации
        const targetID = request.user?._id || request.userID;
        const user = await User.findOne({ _id: targetID }).select('-password');
        
        if (!user) {
            throw CustomException('User not found!', 404);
        }
        return response.send({
            error: false,
            message: 'Success!',
            user
        });
    }
    catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

module.exports = {
    authLogin,
    authLogout,
    authRegister,
    authStatus
};
