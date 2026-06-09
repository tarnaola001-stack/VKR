const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    // ИСПРАВЛЕНО ДЛЯ ВКР: Добавлено поле подкатегории для поддержки 40 специализаций РФ-рынка
    subCategory: {
        type: String,
        required: false,
        default: ""
    },
    cover: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: false,
        default: []
    },
    description: {
        type: String,
        required: true,
    },
    deliveryTime: {
        type: Number,
        required: true,
    },
    revisionNumber: {
        type: Number,
        required: true,
    },
    features: {
        type: [String],
        required: false,
        default: []
    },
    price: {
        type: Number,
        required: true,
    },
    // Поля для обратной совместимости при расчете NoSQL агрегаций
    shortTitle: {
        type: String,
        required: false,
    },
    shortDesc: {
        type: String,
        required: false,
    },
    sales: {
        type: Number,
        default: 0,
        required: false,
    },
    totalStars: {
        type: Number,
        default: 0,
        required: false,
    },
    starNumber: {
        type: Number,
        default: 0,
        required: false,
    }
}, {
    versionKey: false,
    timestamps: true // Автоматическая фиксация дат добавления услуг
});

module.exports = mongoose.model('Gig', gigSchema);
