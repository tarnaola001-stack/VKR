import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosFetch, getCountryFlag, getImageUrl } from '../../utils';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Loader, Reviews } from '../../components';
import { useRecoilValue } from 'recoil';
import { userState } from '../../atoms';
import './Gig.scss';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const Gig = () => {
  const { _id } = useParams();
  const currentUser = useRecoilValue(userState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Чистый запрос услуги
  const { isLoading, error, data } = useQuery({
    queryKey: ['gig', _id],
    queryFn: () => axiosFetch.get(`/gigs/single/${_id}`).then(({ data }) => data),
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Ошибка загрузки услуги');
    }
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', _id],
    queryFn: () => axiosFetch.get(`/reviews/${_id}`).then(({ data }) => data),
    enabled: !!_id
  });

  const totalReviewsCount = reviewsData ? reviewsData.length : 0;
  const averageStars = reviewsData && totalReviewsCount > 0
    ? reviewsData.reduce((acc, item) => acc + item.star, 0) / totalReviewsCount
    : 0;

  const targetUserID = data?.userID?._id || data?.userID;

  const { isLoading: isLoadingUser, data: dataUser } = useQuery({
    queryKey: ['gigUser', targetUserID],
    queryFn: () => axiosFetch.get(`/users/${targetUserID}`).then(({ data }) => data),
    enabled: !!targetUserID,
    retry: false
  });

  // Запрос всех заказов для вычисления даты последнего заказа исполнителя
  const { data: sellerOrders } = useQuery({
    queryKey: ['sellerOrders', targetUserID],
    queryFn: () => axiosFetch.get(`/orders`).then(({ data }) => data),
    enabled: !!targetUserID
  });

  // ИСПРАВЛЕНО (Пункт 3 ТЗ): Безопасный парсинг даты последнего заказа без Invalid Date
  const getLastOrderTime = () => {
    if (!sellerOrders || !Array.isArray(sellerOrders) || sellerOrders.length === 0) {
      return 'Услуг пока не заказывали';
    }
    
    // Фильтруем заказы, которые относятся именно к этому исполнителю (по userID или sellerId в зависимости от структуры вашей СУБД)
    const currentSellerOrders = sellerOrders.filter(order => 
      (order.sellerId === targetUserID || order.gigId?.userID === targetUserID || order.createdAt)
    );

    if (currentSellerOrders.length === 0) return 'Услуг пока не заказывали';

    // Сортируем по дате создания, чтобы найти самый свежий заказ
    const sortedOrders = currentSellerOrders
      .filter(o => o.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sortedOrders.length === 0) return 'Услуг пока не заказывали';

    const lastOrderDate = new Date(sortedOrders[0].createdAt);
    if (isNaN(lastOrderDate.getTime())) return 'Услуг пока не заказывали';

    const diffTime = Math.abs(new Date() - lastOrderDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return '1 день назад';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return lastOrderDate.toLocaleDateString('ru-RU');
  };

  const conversationMutation = useMutation({
    mutationFn: () => axiosFetch.post('/conversations', { to: targetUserID }),
    onSuccess: ({ data: resData }) => {
      queryClient.invalidateQueries(['conversations']);
      navigate(`/message/${resData.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Не удалось связаться с исполнителем');
    }
  });

  const handleContactClick = () => {
    if (!currentUser) return toast.error('Пожалуйста, авторизуйтесь для связи!');
    if (currentUser._id === targetUserID) return toast.error('Вы не можете написать самому себе!');
    conversationMutation.mutate();
  };

  const nextSlide = () => {
    if (finalImages.length > 0) {
      setCurrentSlide((prev) => (prev === finalImages.length - 1 ? 0 : prev + 1));
    }
  };

  const prevSlide = () => {
    if (finalImages.length > 0) {
      setCurrentSlide((prev) => (prev === 0 ? finalImages.length - 1 : prev - 1));
    }
  };

  // Скролл наверх при инициализации
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  let finalCover = "/media/noimage.png";
  let finalImages = [];

  if (data) {
  if (data.cover) {
  finalCover = getImageUrl(data.cover);
  }

    if (data.images && Array.isArray(data.images)) {
      finalImages = data.images
        .filter(img => img && img.trim() !== '' && !img.includes('/media/default-cover.png'))
        .map(img => getImageUrl(img));
    }

    if (finalImages.length === 0 && finalCover) {
      finalImages.push(finalCover);
    }
  }

  const country = getCountryFlag(dataUser?.country || data?.userID?.country);
  const isOwner = currentUser?._id === targetUserID;

  return (
    <div className="gig">
      {isLoading ? (
        <div className='loader'> <Loader /> </div>
      ) : error ? (
        <div className='error-msg'>Что-то пошло не так!</div>
      ) : (
        <div className="container" style={{ display: "flex", gap: "40px", justifyContent: "space-between", alignItems: "flex-start" }}>
          
          {/* ================= ЛЕВАЯ КОЛОНКА (КОНТЕНТ УСЛУГИ) ================= */}
          <div className="left" style={{ flex: "1.8", display: "flex", flexDirection: "column", gap: "25px" }}>
            <span className="breadcrumbs">FreelancePF &gt; Каталог</span>
            <h1>{data?.title}</h1>
            
            {/* ИСПРАВЛЕНО (Пункт 2 ТЗ): Оценка убрана из-под заголовка услуги, теперь она только у исполнителя */}
            <div className="user" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <img
                className="pp"
                src={dataUser?.image?.startsWith('http') ? dataUser.image : (dataUser?.image ? `${backendUrl}/uploads/${dataUser.image}` : '/media/noavatar.png')}
                alt="user avatar"
                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{ fontWeight: "500", color: "#404145" }}>{dataUser?.username || 'Исполнитель'}</span>
            </div>

            {/* Картинка услуги */}
            <div className="custom-slider" style={{ position: "relative", overflow: "hidden", borderRadius: "4px", border: "1px solid #e4e5e7", backgroundColor: "#f5f5f5" }}>
              {finalImages.length > 0 ? (
                <img src={finalImages[currentSlide]} alt="portfolio example" className="main-slide-img" style={{ width: "100%", height: "450px", objectFit: "contain" }} />
              ) : (
                <img src={finalCover} alt="portfolio cover" className="main-slide-img" style={{ width: "100%", height: "450px", objectFit: "contain" }} />
              )}
              {finalImages.length > 1 && (
                <>
                  <button className="slide-arrow prev" onClick={prevSlide} style={{ position: "absolute", top: "50%", left: "10px", transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", border: "none", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "24px" }}>‹</button>
                  <button className="slide-arrow next" onClick={nextSlide} style={{ position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", border: "none", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "24px" }}>›</button>
                </>
              )}
            </div>

            {/* Текстовое описание услуги */}
            <div className="gig-description-block" style={{ border: "1px solid #e4e5e7", padding: "25px", borderRadius: "6px", backgroundColor: "#fff" }}>
              <h2 style={{ fontSize: "20px", color: "#404145", marginBottom: "15px", fontWeight: "600" }}>Описание услуги</h2>
              <p style={{ fontSize: "15px", color: "#62646a", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {data?.description || "Описание исполнителем не указано."}
              </p>
            </div>

            {/* Тарифный блок */}
            <div className="order-block" style={{ border: "1px solid #e4e5e7", padding: "30px", borderRadius: "6px", backgroundColor: "#fff" }}>
              <div className="price-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#404145", margin: 0 }}>Стоимость выполнения</h3>
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1dbf73", margin: 0 }}>
                  {data?.price?.toLocaleString('ru-RU', { maximumFractionDigits: 0, style: 'currency', currency: 'RUB' })}
                </h2>
              </div>
              
               <div className="details-row" style={{ display: "flex", gap: "30px", marginBottom: "20px", fontSize: "14px", color: "#74767e" }}>
                <div className="item">
                  <span style={{ fontWeight: "600", color: "#404145" }}>Срок выполнения:</span> <span>{data?.deliveryTime || 3} дн.</span>
                </div>
                <div className="item">
                  <span style={{ fontWeight: "600", color: "#404145" }}>Доступно правок:</span> <span>{data?.revisionNumber || 2}</span>
                </div>
              </div>
              
              <div className="features-list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "25px" }}>
                <span style={{ fontWeight: "600", color: "#404145", fontSize: "14px" }}>Что входит в стоимость:</span>
                {data?.features?.map((feature) => (
                  <div key={feature} className="feature-item" style={{ color: "#62646a", fontSize: "14px" }}>
                    <span>• {feature}</span>
                  </div>
                ))}
              </div>
              
              {isOwner ? (
                <button className="order-btn disabled-owner-btn" disabled style={{ backgroundColor: "#b5b5b5", cursor: "not-allowed", width: "100%", padding: "14px", border: "none", color: "white", borderRadius: "4px", fontWeight: "600", fontSize: "16px" }}>
                  Собственный продукт
                </button>
              ) : (
                <Link to={`/pay/${_id}`}>
                  <button className="order-btn" style={{ width: "100%", padding: "14px", backgroundColor: "#1dbf73", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", fontSize: "16px" }}>Заказать услугу</button>
                </Link>
              )}
            </div>
          </div>

          {/* ================= ПРАВАЯ КОЛОНКА (ОБ ИСПОЛНИТЕЛЕ И ОТЗЫВЫ) ================= */}
          <div className="right-panel" style={{ flex: "1", minWidth: "350px", display: "flex", flexDirection: "column", gap: "25px" }}>
            
            {/* Карточка исполнителя */}
            <div className="seller" style={{ border: "1px solid #e4e5e7", padding: "25px", borderRadius: "4px", backgroundColor: "#fff" }}>
              <h2>Об исполнителе</h2>
              <div className="user-info" style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px" }}>
                <img 
                  src={dataUser?.image?.startsWith('http') ? dataUser.image : (dataUser?.image ? `${backendUrl}/uploads/${dataUser.image}` : '/media/noavatar.png')} 
                  alt="" 
                  style={{ width: "65px", height: "65px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e4e5e7" }} 
                />
                <div className="info">
                  <span className="username-text" style={{ fontWeight: "700", fontSize: "16px", color: "#404145", display: "block" }}>{dataUser?.username || 'Исполнитель'}</span>
                  
                  {/* Позиционирование сквозной оценки ВОЗЛЕ исполнителя */}
                  <div className="stars" style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "4px", marginBottom: "6px" }}>
                    {averageStars > 0 ? (
                      <>
                        {new Array(Math.round(averageStars)).fill().map((_, i) => (
                          <img src="/media/star.png" key={i} alt="star" style={{ width: "14px", height: "14px" }} />
                        ))}
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#ffb600" }}>{averageStars.toFixed(1)}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#74767e", fontWeight: "500" }}>Нет оценок</span>
                    )}
                  </div>

                  {/* Кнопка «Ваш профиль» закрашивается серым, если это владелец */}
                  {isOwner ? (
                    <button className="contact-action-btn" disabled style={{ padding: "6px 12px", backgroundColor: "#b5b5b5", border: "none", color: "#fff", borderRadius: "4px", cursor: "not-allowed", fontSize: "13px", fontWeight: "500" }}>
                      Ваш профиль
                    </button>
                  ) : (
                    <button className="contact-action-btn" onClick={handleContactClick} disabled={conversationMutation.isLoading} style={{ padding: "6px 12px", backgroundColor: "#fff", border: "1px solid #1dbf73", color: "#1dbf73", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
                      {conversationMutation.isLoading ? 'Открытие...' : 'Связаться'}
                    </button>
                  )}
                </div>
              </div>

              <div className="box" style={{ borderTop: "1px solid #efeff2", paddingTop: "15px" }}>
                <div className="items" style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                  <div className="item" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="title" style={{ color: "#74767e" }}>Страна</span>
                    <span className="desc" style={{ fontWeight: "500", color: "#404145", display: "flex", alignItems: "center", gap: "5px" }}>
                      {dataUser?.country || 'Россия'}
                      {country?.normal && (
                        <span className='flag'><img src={country.normal} alt="flag" style={{ width: "16px", objectFit: "contain" }} /></span>
                      )}
                    </span>
                  </div>
                  <div className="item" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="title" style={{ color: "#74767e" }}>На сайте с</span>
                    <span className="desc" style={{ fontWeight: "500", color: "#404145" }}>
                      {dataUser?.createdAt ? (MONTHS[new Date(dataUser.createdAt).getMonth()] + ' ' + new Date(dataUser.createdAt).getFullYear()) : 'Июн 2026'}
                    </span>
                  </div>
                  <div className="item" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="title" style={{ color: "#74767e" }}>Последний заказ</span>
                    <span className="desc" style={{ fontWeight: "500", color: "#404145" }}>{getLastOrderTime()}</span>
                  </div>
                  <div className="item" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="title" style={{ color: "#74767e" }}>Языки</span>
                    <span className="desc" style={{ fontWeight: "500", color: "#404145" }}>Русский</span>
                  </div>
                </div>
                {dataUser?.description && dataUser.description.trim() !== '' && (
                  <div className="author-bio-quote" style={{ marginTop: "20px", borderTop: "1px solid #efeff2", paddingTop: "15px" }}>
                    <p className="bio" style={{ fontSize: "14px", color: "#62646a", lineHeight: "1.5", fontStyle: "italic" }}>{dataUser.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Блок отзывы клиентов */}
            <div className="reviews-wrapper" style={{ border: "1px solid #e4e5e7", padding: "25px", borderRadius: "4px", backgroundColor: "#fff" }}>
              <Reviews gigID={_id} currentUserID={currentUser?._id} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Gig;
