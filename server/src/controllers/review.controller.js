const Review = require('../models/review.model');
const Gig = require('../models/gig.model');
const { CustomException } = require('../utils');

// СОЗДАНИЕ ОТЗЫВА КЛИЕНТОМ
const createReview = async (request, response) => {
    const { gigID, star, description } = request.body;

    try {
        // 1. Сначала находим саму услугу, к которой пишется отзыв
        const gig = await Gig.findById(gigID);
        if (!gig) {
            throw CustomException('Услуга не найдена в базе данных!', 404);
        }

        // 2. Проверка: Запрещаем автору услуги (исполнителю) накручивать самому себе рейтинг
        if (gig.userID.toString() === request.userID) {
            throw CustomException("Sellers can't create reviews!", 400);
        }

        // 3. Проверка на уникальность: Один пользователь — один отзыв к одной услуге
        const existingReview = await Review.findOne({ gigID, userID: request.userID });
        if (existingReview) {
            throw CustomException('Вы уже оставили свой отзыв к этой услуге!', 400);
        }

        // 4. ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 7): Формируем документ NoSQL с обязательным указанием sellerID
        const review = new Review({
            gigID,
            userID: request.userID,
            sellerID: gig.userID, // Жестко привязываем отзыв к ID исполнителя
            star,
            description
        });

        await review.save();

        // 5. Обновляем счетчики рейтинга внутри документа самой услуги (для обратной совместимости)
        await Gig.findByIdAndUpdate(gigID, {
            $inc: { totalStars: star, starNumber: 1 }
        });

        return response.status(201).send({
            error: false,
            message: 'Отзыв успешно зафиксирован системой!',
            review
        });
    }
    catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// ПОЛУЧЕНИЕ ОТЗЫВОВ
const getReviews = async (request, response) => {
    const { id } = request.params; // ID конкретной услуги (если запрос идет из карточки услуги)
    const { userId } = request.query; // ID фрилансера (если запрос идет из мини-карточки каталога)

    try {
        let queryCondition = {};

        // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 7): Если фронтенд запрашивает сквозной рейтинг исполнителя,
        // делаем выборку по его sellerID, иначе — стандартно по gigID
        if (userId) {
            queryCondition = { sellerID: userId };
        } else {
            queryCondition = { gigID: id };
        }

        const reviews = await Review.find(queryCondition)
            .populate('userID', 'username image img country')
            .sort({ createdAt: -1 }); // Свежие отзывы всегда сверху

        return response.status(200).send(reviews);
    }
    catch ({ message }) {
        return response.status(500).send({
            error: true,
            message: message || 'Ошибка СУБД при получении отзывов'
        });
    }
};

module.exports = {
    createReview,
    getReviews
};
