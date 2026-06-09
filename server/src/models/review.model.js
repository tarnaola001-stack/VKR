const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    gigID: {
        type: String,
        required: true,
    },
    userID: {
        // ID пользователя, который оставил данный отзыв
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 7): Добавлено поле привязки отзыва напрямую к исполнителю
    // для реализации единого сквозного рейтинга человека на платформе
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    star: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5] // Валидация диапазона оценок в СУБД
    },
    description: {
        type: String,
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true // Автоматическая фиксация дат createdAt и updatedAt
});

module.exports = mongoose.model('Review', reviewSchema);
