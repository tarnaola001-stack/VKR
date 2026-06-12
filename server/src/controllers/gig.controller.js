const { Gig } = require('../models');
const { CustomException } = require('../utils');

const createGig = async (request, response) => {
  try {
    if (!request.isSeller) {
      throw CustomException('Только пользователи со статусом исполнителя могут создавать новые услуги!', 403);
    }
    const gig = new Gig({
      userID: request.userID,
      ...request.body
    });
    await gig.save();
    return response.status(201).send(gig);
  }
  catch (error) {
    if (error.name === 'ValidationError') {
      let message = 'Ошибка заполнения: ';
      if (error.errors.cover) message = 'Пожалуйста, выберите и загрузите обложку услуги!';
      else if (error.errors.category) message = 'Пожалуйста, выберите специализацию услуги из списка!';
      else if (error.errors.title) message = 'Пожалуйста, укажите корректное название услуги!';
      else if (error.errors.description) message = 'Пожалуйста, заполните подробное описание услуги!';
      else if (error.errors.deliveryTime) message = 'Пожалуйста, укажите срок выполнения в днях!';
      else if (error.errors.price) message = 'Пожалуйста, укажите стоимость услуги!';
      else message += Object.values(error.errors).map(e => e.message).join(', ');
      
      return response.status(400).send({
        error: true,
        message: message
      });
    }
    return response.status(error.status || 500).send({
      error: true,
      message: error.message || 'Внутренняя ошибка сервера при создании услуги'
    });
  }
};

const deleteGig = async (request, response) => {
  const { _id } = request.params;
  try {
    const gig = await Gig.findOne({ _id });
    if (!gig) {
      throw CustomException('Услуга не найдена!', 404);
    }
    if (request.userID === gig.userID.toString()) {
      await Gig.deleteOne({ _id });
      return response.send({
        error: false,
        message: 'Услуга была успешно удалена!'
      });
    }
    throw CustomException('Некорректный запрос! Вы не можете удалять услуги других пользователей!', 403);
  }
  catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message
    });
  }
};

const getGig = async (request, response) => {
  const { _id } = request.params;
  try {
    const gig = await Gig.findOne({ _id }).populate('userID', 'username country image img createdAt email description isSeller');
    if (!gig) {
      throw CustomException('Услуга не найдена!', 404);
    }
    return response.send(gig);
  }
  catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message
    });
  }
};

const getGigs = async (request, response) => {
  const { category, subCategory, search, max, min, userID, sort } = request.query;
  try {
    const filters = {
      ...(userID && { userID }),
      ...(category && { category: category }),
      ...(subCategory && { subCategory: subCategory }),
      ...(search && { title: { $regex: search, $options: 'i' } }),
      ...((min || max) && {
        price: {
          ...(max && { $lte: parseInt(max) }),
          ...(min && { $gte: parseInt(min) }),
        },
      })
    };

    const sortOption = sort === "createdAt" ? { createdAt: -1 } : { sales: -1 };

    const gigs = await Gig.find(filters)
      .sort(sortOption)
      .populate('userID', 'username cover email description isSeller _id image img');

    const calculatedGigs = await Promise.all(
      gigs.map(async (gig) => {
        const gigObj = gig.toObject();
        const authorId = gig.userID?._id || gig.userID;

        if (authorId) {
          const allSellerGigs = await Gig.find({ userID: authorId });
          
          let totalStars = 0;
          let totalRatingsCount = 0;

          allSellerGigs.forEach(g => {
            if (g.starNumber && g.starNumber > 0) {
              totalStars += g.totalStars || 0;
              totalRatingsCount += g.starNumber;
            }
          });

          gigObj.authorTotalStars = totalStars;
          gigObj.authorStarNumber = totalRatingsCount;
        } else {
          gigObj.authorTotalStars = 0;
          gigObj.authorStarNumber = 0;
        }

        return gigObj;
      })
    );

    return response.send(calculatedGigs);
  }
  catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message
    });
  }
};

module.exports = {
  createGig,
  deleteGig,
  getGig,
  getGigs
};
