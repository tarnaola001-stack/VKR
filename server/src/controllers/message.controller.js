const { Message, Conversation } = require('../models');

const createMessage = async (request, response) => {
    const { conversationID, description } = request.body;

    try {
        const message = new Message({
            conversationID,
            userID: request.userID,
            description
        });

        await message.save();

        // ИСПРАВЛЕНО ДЛЯ ВКР: Синхронизировано поле поиска (id вместо conversationID) для точного обновления превью чата
        await Conversation.findOneAndUpdate(
            { id: conversationID }, 
            {
                $set: {
                    // Тот, кто отправил сообщение, автоматически прочитал его
                    readBySeller: request.isSeller,
                    readByBuyer: !request.isSeller,
                    lastMessage: description
                }
            }, 
            { new: true }
        );

        return response.status(201).send(message);
    }
    catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

const getMessages = async (request, response) => {
    const { conversationID } = request.params;
    try {
        // Запрашиваем историю сообщений и подтягиваем данные отправителя
        const messages = await Message.find({ conversationID }).populate('userID', 'username image email img isSeller');

        // ИСПРАВЛЕНО ДЛЯ ВКР: Защита от поврежденных связей в СУБД MongoDB Atlas
        const safeMessages = messages.map(msg => {
            const doc = msg.toObject ? msg.toObject() : msg;
            if (!doc.userID) {
                doc.userID = { _id: "deleted", username: "Пользователь", image: "/media/noavatar.png", img: "/media/noavatar.png" };
            }
            return doc;
        });

        // ИСПРАВЛЕНО ДЛЯ ВКР: Логика прочтения диалога при его открытии пользователем (Включение двойных галочек)
        await Conversation.findOneAndUpdate(
            { id: conversationID },
            {
                $set: {
                    // Если зашел исполнитель — помечаем прочитанным исполнителем, если заказчик — заказчиком
                    ...(request.isSeller ? { readBySeller: true } : { readByBuyer: true })
                }
            }
        );

        return response.status(200).send(safeMessages);
    }
    catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

module.exports = {
    createMessage,
    getMessages
};
