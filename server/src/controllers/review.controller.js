const { Review, Gig } = require('../models');
const { CustomException } = require('../utils');

const createReview = async (request, response) => {
  const { gigID, star, description } = request.body;
  try {
    // Проверяем, не оставлял ли этот пользователь отзыв на эту услугу ранее
    const existingReview = await Review.findOne({ gigID, userID: request.userID });
    if (existingReview) {
      throw CustomException('Вы уже оставляли отзыв к этой услуге!', 400);
    }

    // Находим саму услугу, чтобы узнать ID её автора
    const gig = await Gig.findById(gigID);
    if (!gig) {
      throw CustomException('Услуга не найдена!', 404);
    }

    if (gig.userID.toString() === request.userID) {
      throw CustomException('Вы не можете оставлять отзывы к своим собственным услугам!', 400);
    }

    const review = new Review({
      gigID,
      userID: request.userID,
      sellerID: gig.userID,
      star,
      description
    });

    await review.save();

    // Автоматически обновляем агрегированный рейтинг услуги в СУБД
    await Gig.findByIdAndUpdate(gigID, {
      $inc: { totalStars: star, starNumber: 1 }
    });

    return response.status(201).send(review);
  }
  catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message
    });
  }
};

const getReviews = async (request, response) => {
  const { gigID } = request.params;
  try {
    // Подгружаем данные авторов отзывов (логин и аватарку)
    const reviews = await Review.find({ gigID }).populate('userID', 'username image img');
    return response.status(200).send(reviews);
  }
  catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message
    });
  }
};

module.exports = {
  createReview,
  getReviews
};
