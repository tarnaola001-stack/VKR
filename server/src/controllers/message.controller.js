const { Message, Conversation } = require('../models');

const createMessage = async (request, response) => {
  const { conversationID, description } = request.body;
  try {
    const message = new Message({
      conversationID,
      userID: request.userID,
      description,
      isRead: false // Новое сообщение всегда создается непрочитанным
    });
    await message.save();

    // Находим диалог, чтобы определить, кем в нем является отправитель сообщения
    const currentConv = await Conversation.findOne({ conversationID });
    if (!currentConv) {
      return response.status(404).send({ error: true, message: "Чат не найден" });
    }

    const isSenderSeller = currentConv.sellerID.toString() === request.userID;

    // Собеседник получает статус unread, а отправитель - read
    await Conversation.findOneAndUpdate(
      { conversationID: conversationID }, 
      {
        $set: {
          readBySeller: isSenderSeller,      // Для продавца прочитано, если он сам автор
          readByBuyer: !isSenderSeller,     // Для покупателя прочитано, если он сам автор
          lastMessage: description
        }
      }, 
      { new: true }
    );

    return response.status(201).send(message);
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || "Ошибка отправки сообщения"
    });
  }
};

const getMessages = async (request, response) => {
  const { conversationID } = request.params;
  try {
    // ИСПРАВЛЕНО КРИТИЧЕСКИЙ БАГ СИНХРОНИЗАЦИИ: 
    // Как только пользователь запрашивает сообщения чата, помечаем все входящие письма от собеседника как прочитанные в MongoDB
    await Message.updateMany(
      { 
        conversationID, 
        userID: { $ne: request.userID } // Находим только чужие сообщения
      },
      { 
        $set: { isRead: true } 
      }
    );

    // Подгружаем обновленный массив сообщений для отправки на фронтенд
    const messages = await Message.find({ conversationID }).populate('userID', 'username image email img isSeller');
    
    const safeMessages = messages.map(msg => {
      const doc = msg.toObject ? msg.toObject() : msg;
      if (!doc.userID) {
        doc.userID = { _id: "deleted", username: "Пользователь", image: "/media/noavatar.png", img: "/media/noavatar.png" };
      }
      return doc;
    });

    const currentConv = await Conversation.findOne({ conversationID });
    if (currentConv) {
      const isUserSeller = currentConv.sellerID.toString() === request.userID;

      // Гасим общий маркер непрочитанности для всей комнаты чата
      await Conversation.findOneAndUpdate(
        { conversationID: conversationID },
        {
          $set: {
            ...(isUserSeller ? { readBySeller: true } : { readByBuyer: true })
          }
        }
      );
    }

    return response.status(200).send(safeMessages);
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || "Ошибка загрузки сообщений"
    });
  }
};

module.exports = {
  createMessage,
  getMessages
};
