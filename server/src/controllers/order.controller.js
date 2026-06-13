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
    
    const sumStep1 = Math.round(gig.price * 0.4);
    const sumStep2 = gig.price - sumStep1;

    const order = new Order({
      gigID: gig._id,
      image: gig.cover || "/media/default-cover.png",
      title: gig.title,
      price: gig.price,
      buyerID: request.userID,
      sellerID: gig.userID,
      isCompleted: true,
      payment_intent: "wkr_demo_intent_" + Math.random().toString(36).substring(2, 9),
      readBySeller: false,
      readByBuyer: true,
      deliveryTime: gig.deliveryTime || 1, 
      milestones: [
        { title: "Этап 1: Разработка прототипа и согласование ТЗ (40%)", weight: 40, sum: sumStep1, status: 'In_Progress' },
        { title: "Этап 2: Финальная сборка и передача исходных файлов (60%)", weight: 60, sum: sumStep2, status: 'In_Progress' }
      ]
    });
    
    await order.save();
    await Gig.findByIdAndUpdate(id, { $inc: { sales: 1 } });
    return response.status(201).send({
      error: false,
      message: 'Заказ успешно оформлен! Средства депонированы по схеме 40/60.',
      order
    });
  } catch (error) {
    return response.status(error.status || 500).send({ error: true, message: error.message });
  }
};

const getOrders = async (request, response) => {
  try {
    const orders = await Order.find({
      $or: [{ sellerID: request.userID }, { buyerID: request.userID }],
      isCompleted: true
    })
    .populate('buyerID', 'username image img email isSeller')
    .populate('sellerID', 'username image img email isSeller')
    .sort({ createdAt: -1 });

    return response.status(200).send(orders);
  } catch (error) {
    return response.status(500).send({ error: true, message: error.message });
  }
};

const markOrdersAsRead = async (request, response) => {
  try {
    await Order.updateMany(
      { sellerID: request.userID, readBySeller: false },
      { $set: { readBySeller: true } }
    );
    await Order.updateMany(
      { buyerID: request.userID, readByBuyer: false },
      { $set: { readByBuyer: true } }
    );
    return response.status(200).send({ error: false, message: "Оповещения успешно сброшены" });
  } catch (error) {
    return response.status(500).send({ error: true, message: error.message });
  }
};

const submitMilestone = async (request, response) => {
  const { orderId, milestoneId } = request.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) throw CustomException('Заказ не найден', 404);
    if (order.sellerID.toString() !== request.userID) throw CustomException('Доступ запрещен', 403);

    const milestone = order.milestones.id(milestoneId);
    if (!milestone) throw CustomException('Этап не найден', 404);
    
    if (milestone.status !== 'In_Progress' && milestone.status !== 'Rejected_In_Progress') {
      throw CustomException('Этап уже находится на проверке или завершен', 400);
    }

    milestone.status = 'Under_Review';
    order.readByBuyer = false; 

    await order.save();
    return response.status(200).send({ error: false, message: 'Этап успешно отправлен на проверку заказчику!', order });
  } catch (error) {
    return response.status(error.status || 500).send({ error: true, message: error.message });
  }
};

const reviewMilestone = async (request, response) => {
  const { orderId, milestoneId, action } = request.body; 
  try {
    const order = await Order.findById(orderId);
    if (!order) throw CustomException('Заказ не найден', 404);
    if (order.buyerID.toString() !== request.userID) throw CustomException('Доступ запрещен', 403);

    const milestone = order.milestones.id(milestoneId);
    if (!milestone) throw CustomException('Этап не найден', 404);
    if (milestone.status !== 'Under_Review') throw CustomException('Этап не находится на проверке', 400);

    if (action === 'approve') {
      milestone.status = 'Completed';
      order.readBySeller = true; 
    } else {
      milestone.status = 'Rejected_In_Progress'; 
      order.readBySeller = false; 
    }

    order.readByBuyer = true; 

    await order.save();
    return response.status(200).send({ 
      error: false, 
      message: action === 'approve' ? 'Этап успешно принят, средства переведены!' : 'Этап отправлен обратно на доработку.',
      order 
    });
  } catch (error) {
    return response.status(error.status || 500).send({ error: true, message: error.message });
  }
};

const extendOrderTime = async (request, response) => {
  const { orderId } = request.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) throw CustomException('Заказ не найден', 404);
    if (order.buyerID.toString() !== request.userID) throw CustomException('Доступ запрещен', 403);

    order.extendedDays += 2; 
    order.readByBuyer = true;
    await order.save();
    return response.status(200).send({ error: false, message: 'Срок выполнения успешно продлен на 2 дня!', order });
  } catch (error) {
    return response.status(error.status || 500).send({ error: true, message: error.message });
  }
};

// СТРОГИЙ ЭКСПОРТ: Все функции экспортируются ровно по одному разу
module.exports = {
  createOrder,
  getOrders,
  markOrdersAsRead,
  submitMilestone,
  reviewMilestone,
  extendOrderTime
};
