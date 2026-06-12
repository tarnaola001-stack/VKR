const { Conversation } = require('../models');
const { CustomException } = require('../utils');

const createConversation = async (request, response) => {
  const { to, title, gigID } = request.body; // ИСПРАВЛЕНО: принимаем gigID с фронтенда
  
  if (request.userID === to) {
    return response.status(400).send({
      error: true,
      message: "Вы не можете начать диалог с самим собой!"
    });
  }

  try {
    const sellerID = to;
    const buyerID = request.userID;
    
    // ИСПРАВЛЕНО КРИТИЧЕСКИЙ БАГ: Уникальный ID чата теперь жестко изолирован под конкретную услугу
    const computedConversationID = gigID 
      ? `${sellerID}-${buyerID}-${gigID}` 
      : `${sellerID}-${buyerID}`;

    const existingConversation = await Conversation.findOne({ conversationID: computedConversationID });
    if (existingConversation) {
      if (title && existingConversation.title !== title) {
        existingConversation.title = title;
        await existingConversation.save();
      }
      return response.status(200).send(existingConversation);
    }

    const conversation = new Conversation({
      conversationID: computedConversationID,
      sellerID: sellerID,
      buyerID: buyerID,
      title: title || "Обсуждение услуги",
      readBySeller: false,
      readByBuyer: true
    });

    await conversation.save();
    return response.status(201).send(conversation);
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || "Ошибка при генерации диалога"
    });
  }
};

const getConversations = async (request, response) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { sellerID: request.userID },
        { buyerID: request.userID }
      ]
    })
    .populate('buyerID', 'username image email img isSeller')
    .populate('sellerID', 'username image email img isSeller')
    .sort({ updatedAt: -1 });

    return response.send(conversations);
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || "Ошибка загрузки списка чатов"
    });
  }
};

const getSingleConversation = async (request, response) => {
  const { sellerID, buyerID } = request.params;
  try {
    const conversation = await Conversation.findOne({ sellerID, buyerID })
      .populate('buyerID', 'username image email img isSeller')
      .populate('sellerID', 'username image email img isSeller');
      
    if (!conversation) {
      return response.status(404).send({
        error: true,
        message: 'Диалог еще не создан!'
      });
    }
    return response.status(200).send(conversation);
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || "Ошибка при обращении к коллекции диалогов СУБД"
    });
  }
};

const updateConversation = async (request, response) => {
  const { conversationID } = request.params;
  try {
    const currentConv = await Conversation.findOne({ conversationID });
    if (!currentConv) {
      return response.status(404).send({ error: true, message: "Чат не найден" });
    }

    const isUserSellerInThisChat = currentConv.sellerID.toString() === request.userID;

    const conversation = await Conversation.findOneAndUpdate(
      { conversationID }, 
      {
        $set: {
          ...(isUserSellerInThisChat ? { readBySeller: true } : { readByBuyer: true })
        }
      }, 
      { new: true }
    );
    return response.send(conversation);
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || "Ошибка обновления статуса прочтения"
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getSingleConversation,
  updateConversation
};
