const Order = require('../models/order.model');
const Gig = require('../models/gig.model');
const { CustomException } = require('../utils');

const createOrder = async (request, response) => {
  const { id } = request.params;

  try {
    const gig = await Gig.findById(id);
    if (!gig) {
      throw CustomException('Указанная услуга не найдена в каталоге платформы!', 404);
    }

    if (gig.userID.toString() === request.userID) {
      throw CustomException('Вы не можете приобрести свою собственную услугу!', 400);
    }

    const order = new Order({
      gigID: gig._id,
      image: gig.cover || "/media/default-cover.png",
      title: gig.title,
      price: gig.price,
      buyerID: request.userID,
      sellerID: gig.userID,
      isCompleted: true,
      payment_intent: "wkr_demo_intent_" + Math.random().toString(36).substring(2, 9)
    });

    await order.save();

    await Gig.findByIdAndUpdate(id, {
      $inc: { sales: 1 }
    });

    return response.status(201).send({
      error: false,
      message: 'Заказ успешно оформлен и оплачен в демонстрационном режиме шлюза МИР!',
      order
    });
  }
  catch (error) {
    return response.status(error.status || 500).send({
      error: true,
      message: error.message || 'Ошибка при проведении финансовой операции в СУБД'
    });
  }
};

// ИСПРАВЛЕНО (Стр. 5, 6, 8 отчета): Сквозной сбор контрактов вне зависимости от глобального флага роли
const getOrders = async (request, response) => {
  try {
    const orders = await Order.find({
      $or: [
        { sellerID: request.userID },
        { buyerID: request.userID }
      ],
      isCompleted: true
    })
    .populate('buyerID', 'username image img email isSeller')
    .populate('sellerID', 'username image img email isSeller')
    .sort({ createdAt: -1 });

    return response.status(200).send(orders);
  }
  catch (error) {
    return response.status(500).send({
      error: true,
      message: error.message || 'Ошибка СУБД при формировании таблицы заказов'
    });
  }
};

module.exports = {
  createOrder,
  getOrders
};
