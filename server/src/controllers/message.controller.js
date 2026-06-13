const { Message, Conversation } = require('../models');

const createMessage = async (request, response) => {
  const { conversationID, description, files } = request.body; // Принимаем массив файлов с фронтенда
  try {
    const message = new Message({
      conversationID,
      userID: request.userID,
      description: description || "",
      files: files || [], // Сохраняем переданные файлы
      isRead: false 
    });
    await message.save();

    const currentConv = await Conversation.findOne({ conversationID });
    if (!currentConv) {
      return response.status(404).send({ error: true, message: "Чат не найден" });
    }
    const isSenderSeller = currentConv.sellerID.toString() === request.userID;

    await Conversation.findOneAndUpdate(
      { conversationID: conversationID }, 
      {
        $set: {
          readBySeller: isSenderSeller, 
          readByBuyer: !isSenderSeller, 
          lastMessage: description || "Отправлены файлы..."
        }
      }, 
      { new: true }
    );
    
    // Подгружаем данные пользователя перед ответом, чтобы фронтенд сразу видел имя
    const populatedMessage = await Message.findById(message._id).populate('userID', 'username image email isSeller');
    return response.status(201).send(populatedMessage);
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
    await Message.updateMany(
      { 
        conversationID, 
        userID: { $ne: request.userID } 
      },
      { 
        $set: { isRead: true } 
      }
    );

    // Добавлено populate для извлечения имени (username) и аватарки отправителя
    const messages = await Message.find({ conversationID })
      .populate('userID', 'username image email isSeller')
      .sort({ createdAt: 1 }); // Сортируем по времени создания

    const safeMessages = messages.map(msg => {
      const doc = msg.toObject ? msg.toObject() : msg;
      if (!doc.userID) {
        doc.userID = { _id: "deleted", username: "Пользователь", image: "/media/noavatar.png" };
      }
      return doc;
    });

    const currentConv = await Conversation.findOne({ conversationID });
    if (currentConv) {
      const isUserSeller = currentConv.sellerID.toString() === request.userID;
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
