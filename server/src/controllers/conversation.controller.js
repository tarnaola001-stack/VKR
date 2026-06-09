const { Conversation } = require('../models');
const { CustomException } = require('../utils');

// СОЗДАНИЕ ДИАЛОГА
const createConversation = async (request, response) => {
    const { to, from } = request.body;
    try {
        const conversation = new Conversation({
            conversationID: request.isSeller ? `${request.userID}-${from}` : `${to}-${request.userID}`,
            sellerID: request.isSeller ? request.userID : to,
            buyerID: request.isSeller ? from : request.userID,
            readBySeller: request.isSeller,
            readByBuyer: !request.isSeller
        });
        await conversation.save();
        return response.status(201).send(conversation);
    }
    catch ({ message }) {
        return response.status(500).send({
            error: true,
            message: message || "Ошибка при генерации диалога"
        });
    }
};

// ПОЛУЧЕНИЕ ВСЕХ ДИАЛОГОВ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
const getConversations = async (request, response) => {
    try {
        const conversation = await Conversation.find(request.isSeller ? { sellerID: request.userID } : { buyerID: request.userID })
            .populate(request.isSeller ? 'buyerID' : 'sellerID', 'username image email img')
            .sort({ updatedAt: -1 });
        return response.send(conversation);
    }
    catch ({ message }) {
        return response.status(500).send({
            error: true,
            message: message || "Ошибка загрузки списка чатов"
        });
    }
};

// ИСПРАВЛЕНО ДЛЯ ВКР: Полноценный безопасный поиск существующего диалога по ID участников
const getSingleConversation = async (request, response) => {
    const { sellerID, buyerID } = request.params;
    try {
        // Ищем диалог, где участвуют оба контрагента
        const conversation = await Conversation.findOne({ sellerID, buyerID });
        
        if (!conversation) {
            return response.status(404).send({
                error: true,
                message: 'Диалог еще не создан!'
            });
        }
        return response.status(200).send(conversation);
    }
    catch ({ message }) {
        return response.status(500).send({
            error: true,
            message: message || "Ошибка при обращении к коллекции диалогов СУБД"
        });
    }
};

// ПОМЕТКА ДИАЛОГА КАК ПРОЧИТАННОГО
const updateConversation = async (request, response) => {
    const { conversationID } = request.params;
    try {
        const conversation = await Conversation.findOneAndUpdate(
            { conversationID }, 
            {
                $set: {
                    ...(request.isSeller ? { readBySeller: true } : { readByBuyer: true })
                }
            }, 
            { new: true }
        );
        return response.send(conversation);
    }
    catch ({ message }) {
        return response.status(500).send({
            error: true,
            message: message || "Ошибка обновления статуса прочтения"
        });
    }
};

module.exports = {
    createConversation,
    getConversations,
    getSingleConversation,
    updateConversation
};
