import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { axiosFetch } from '../../utils';
import { Loader, Review } from '../../components';
import './Reviews.scss';

const Reviews = ({ gigID, currentUserID }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5); 
  const [hoverRating, setHoverRating] = useState(0); 

  // Запрос массива отзывов по ID услуги [INDEX]
  const { isLoading, error, data } = useQuery({
    queryKey: ['reviews', gigID],
    queryFn: () => axiosFetch.get(`/reviews/${gigID}`).then(({ data }) => data)
  });

  // Запрос самой услуги для определения её автора [INDEX]
  const { data: gigData } = useQuery({
    queryKey: ['gig', gigID],
    queryFn: () => axiosFetch.get(`/gigs/single/${gigID}`).then(({ data }) => data),
    enabled: !!gigID
  });

  const mutation = useMutation({
    mutationFn: (review) => axiosFetch.post('/reviews', review),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', gigID]);
      toast.success('Отзыв успешно добавлен!');
      setRating(5); 
    },
    onError: (err) => {
      const msg = err.response?.data?.message;
      if (msg === "Sellers can't create reviews!") {
        toast.error('Исполнители не могут оставлять отзывы к собственным услугам!');
      } else {
        toast.error(msg || 'Не удалось отправить отзыв');
      }
    }
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const description = textarea.value.trim();

    if (!description) {
      return toast.error('Пожалуйста, напишите text отзыва!');
    }

    mutation.mutate({ gigID, description, star: rating });
    textarea.value = '';
  };

  // Проверка №1: Оставлял ли этот пользователь отзыв ранее [INDEX]
  const hasUserAlreadyReviewed = data 
    ? data.some((review) => review.userID?._id === currentUserID || review.userID === currentUserID)
    : false;

  // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 4): Проверка №2 — является ли текущий юзер автором этой услуги
  const isOwnerOfGig = gigData?.userID?._id === currentUserID || gigData?.userID === currentUserID;

  return (
    <div className="reviews">
      <h2>Отзывы клиентов</h2>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <p>Не удалось загрузить отзывы.</p>
      ) : data?.length === 0 ? (
        <p style={{ color: 'gray', fontStyle: 'italic', fontSize: '14px' }}>Отзывов пока нет. Станьте первым!</p>
      ) : (
        data.map((review) => <Review key={review._id} review={review} />)
      )}

      {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 4): Полностью блокируем и скрываем форму ввода для исполнителя в его же карточке */}
      {isOwnerOfGig ? (
        <div className="review-already-submitted" style={{ backgroundColor: "#f5f5f5", border: "1px dashed #ccc", color: "#74767e" }}>
          <p>Вы являетесь исполнителем данной услуги. Добавление отзывов к собственным продуктам заблокировано.</p>
        </div>
      ) : hasUserAlreadyReviewed ? (
        <div className="review-already-submitted">
          <p>Вы уже оставили отзыв к этой услуге. Повторная оценка невозможна.</p>
        </div>
      ) : (
        <div className="add-review-box">
          <h3>Оставить отзыв</h3>
          <form className="addForm" onSubmit={handleFormSubmit}>
            <textarea 
              cols="30" 
              rows="4" 
              placeholder="Поделитесь вашим впечатлением о выполненной работе исполнителя..."
            ></textarea>
            
            <div className="interactive-stars-rating">
              <span className="rating-label">Ваша оценка услуги:</span>
              <div className="stars-line">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`interactive-star-item ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                ))}
                <span className="rating-number-badge">({hoverRating || rating} из 5)</span>
              </div>
            </div>
            
            <button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Отправка...' : 'Отправить отзыв'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Reviews;
