const Order = require('../models/order.model');
const Gig = require('../models/gig.model');
const { CustomException } = require('../utils');

// ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 1.2, 6, 12): Создание и фиксация оплаченного заказа в СУБД MongoDB Atlas
const createOrder = async (request, response) => {
    const { id } = request.params; // ID приобретаемой услуги

    try {
        // 1. Находим услугу, которую пытается приобрести заказчик
        const gig = await Gig.findById(id);
        if (!gig) {
            throw CustomException('Указанная услуга не найдена в каталоге платформы!', 404);
        }

        // 2. Проверка: Запрет самовыкупа (Дополнительная защита на уровне бэкенда)
        if (gig.userID.toString() === request.userID) {
            throw CustomException('Вы не можете приобрести свою собственную услугу!', 400);
        }

        // 3. Формируем полноценный NoSQL-документ заказа для связки "заказчик-исполнитель"
        const order = new Order({
            gigID: gig._id,
            image: gig.cover || "/media/default-cover.png",
            title: gig.title,
            price: gig.price,
            buyerID: request.userID,  // Текущий авторизованный пользователь (заказчик)
            sellerID: gig.userID,     // Автор услуги (исполнитель)
            isCompleted: true,         // Статус "Оплачено" выставляется автоматически симулятором
            payment_intent: "wkr_demo_intent_" + Math.random().toString(36).substring(2, 9) // Генерация фейкового токена эквайринга РФ-банка
        });

        await order.save();

        // 4. Инкрементируем счетчик продаж (sales) внутри документа услуги
        await Gig.findByIdAndUpdate(id, {
            $inc: { sales: 1 }
        });

        return response.status(201).send({
            error: false,
            message: 'Заказ успешно оформлен и оплачен в демонстрационном режиме шлюза МИР!',
            order
        });
    }
    catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message: message || 'Ошибка при проведении финансовой операции в СУБД'
        });
    }
};

// ПОЛУЧЕНИЕ СПИСКА ЗАКАЗОВ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
const getOrders = async (request, response) => {
    try {
        // Ищем заказы, где пользователь выступает либо покупателем, либо продавцом
        const queryCondition = request.isSeller 
            ? { sellerID: request.userID } 
            : { buyerID: request.userID };

        const orders = await Order.find({
            ...queryCondition,
            isCompleted: true // Выводим только успешно оплаченные контракты
        })
        .populate('buyerID', 'username image img email')
        .populate('sellerID', 'username image img email')
        .sort({ createdAt: -1 }); // Свежие контракты всегда отображаются сверху

        return response.status(200).send(orders);
    }
    catch ({ message }) {
        return response.status(500).send({
            error: true,
            message: message || 'Ошибка СУБД при формировании таблицы заказов'
        });
    }
};

module.exports = {
    createOrder, // Экспорт метода создания оплаченного заказа
    getOrders
};
