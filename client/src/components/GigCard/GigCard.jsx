import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from '../../utils';
import './GigCard.scss';

const GigCard = (props) => {
  const { data } = props;
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Корректируем путь к обложке для локального файл-сервера
  const coverUrl = data.cover && data.cover.startsWith('http') 
    ? data.cover 
    : `${backendUrl}/uploads/${data.cover}`;

  // Корректируем путь к аватарке автора
  const avatarUrl = data.userID?.image && data.userID.image.startsWith('http')
    ? data.userID.image
    : (data.userID?.image ? `${backendUrl}/uploads/${data.userID.image}` : '/media/noavatar.png');

  // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 7): Запрашиваем отзывы, привязанные ко ВСЕМ услугам данного пользователя,
  // чтобы сформировать единый сквозной рейтинг человека на платформе, а не отдельного товара
  const { data: freelancerReviews } = useQuery({
    queryKey: ['freelancerReviews', data.userID?._id],
    queryFn: () => 
      axiosFetch.get(`/reviews?userId=${data.userID?._id || data.userID}`)
        .then(({ data }) => data)
        .catch(() => []),
    enabled: !!data.userID?._id || !!data.userID
  });

  // Вычисляем честный и актуальный балл на основе существующих в базе отзывов
  const userReviews = freelancerReviews || [];
  const totalReviewsCount = userReviews.length;
  const averageStars = totalReviewsCount > 0
    ? userReviews.reduce((acc, item) => acc + item.star, 0) / totalReviewsCount
    : 0;

  return (
    <Link to={`/gig/${data._id}`} className="link">
      <div className="gigCard">
        {/* Изображение обложки услуги */}
        <img src={coverUrl} alt="Обложка услуги" />
        
        <div className="info">
          {/* Блок автора услуги (Звезды перенесены наверх к исполнителю) */}
          <div className="user" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
            <div className="user-profile-meta" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={avatarUrl} alt={data.userID?.username} />
              <span>{data.userID?.username || 'Исполнитель'}</span>
            </div>
            
            {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 7): Сквозной рейтинг автора */}
            <div className="star" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <img src="/media/star.png" alt="Рейтинг" style={{ width: "14px", height: "14px", objectFit: "contain" }} />
              <span style={{ fontWeight: "bold", color: "#ffc107", fontSize: "14px" }}>
                {averageStars > 0 ? averageStars.toFixed(1) : 'Новый'}
              </span>
              {totalReviewsCount > 0 && (
                <span className='totalStars' style={{ color: "#999", fontSize: "12px" }}>({totalReviewsCount})</span>
              )}
            </div>
          </div>

          {/* Название услуги */}
          <p className="gig-title-text" style={{ margin: "10px 0", minHeight: "44px" }}>{data.title}</p>
        </div>
        
        <hr />
        
        {/* Нижний тарифный блок */}
        <div className="detail">
          <div className="price">
            <span>СТОИМОСТЬ ОТ</span>
            <h2>
              {data.price.toLocaleString('ru-RU', {
                maximumFractionDigits: 0,
                style: 'currency',
                currency: 'RUB'
              })}
            </h2>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
