import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosFetch, getCountryFlag } from '../../utils';
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
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Запрос данных услуги [INDEX]
  const { isLoading, error, data } = useQuery({
    queryKey: ['gig', _id],
    queryFn: () =>
      axiosFetch.get(`/gigs/single/${_id}`)
        .then(({ data }) => {
          if (data) {
            if (data.cover && !data.cover.startsWith('http')) {
              data.cover = `${backendUrl}/uploads/${data.cover}`;
            }
            if (data.images) {
              data.images = data.images.map(img => img.startsWith('http') ? img : `${backendUrl}/uploads/${img}`);
            }
            if (data.images && !data.images.includes(data.cover)) {
              data.images.unshift(data.cover);
            }
          }
          return data;
        })
        .catch(({ response }) => {
          toast.error(response?.data?.message || 'Ошибка загрузки услуги');
        })
  });

  // Запрос реального массива отзывов [INDEX]
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', _id],
    queryFn: () => axiosFetch.get(`/reviews/${_id}`).then(({ data }) => data),
    enabled: !!_id
  });

  const totalReviewsCount = reviewsData ? reviewsData.length : 0;
  const averageStars = reviewsData && totalReviewsCount > 0
    ? reviewsData.reduce((acc, item) => acc + item.star, 0) / totalReviewsCount
    : 0;

  const { data: sellerOrders } = useQuery({
    queryKey: ['sellerOrders', data?.userID?._id],
    queryFn: () => axiosFetch.get(`/orders`).then(({ data }) => data),
    enabled: !!data?.userID?._id
  });

  const getLastOrderTime = () => {
    if (!sellerOrders || sellerOrders.length === 0) return 'Услуг пока не заказывали';
    const lastOrder = sellerOrders[sellerOrders.length - 1];
    const diffTime = Math.abs(new Date() - new Date(lastOrder.createdAt));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return '1 день назад';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return new Date(lastOrder.createdAt).toLocaleDateString('ru-RU');
  };

  const conversationMutation = useMutation({
    mutationFn: () => axiosFetch.post('/conversations', { to: data?.userID?._id }),
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
    if (currentUser._id === data?.userID?._id) return toast.error('Вы не можете написать самому себе!');
    conversationMutation.mutate();
  };

  const nextSlide = () => {
    if (data?.images) {
      setCurrentSlide((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevSlide = () => {
    if (data?.images) {
      setCurrentSlide((prev) => (prev === 0 ? data.images.length - 1 : prev - 1));
    }
  };

  const country = getCountryFlag(data?.userID?.country);
  
  // Проверка: является ли текущий авторизованный пользователь автором этой услуги [INDEX]
  const isOwner = currentUser?._id === data?.userID?._id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="gig">
      {isLoading ? (
        <div className='loader'> <Loader /> </div>
      ) : error ? (
        <div className='error-msg'>Что-то пошло не так!</div>
      ) : (
        <div className="container">
          <div className="left">
            <span className="breadcrumbs">Разработка и IT</span>
            <h1>{data?.title}</h1>
            <div className="user">
              <img
                className="pp"
                src={data?.userID?.image?.startsWith('http') ? data.userID.image : (data?.userID?.image ? `${backendUrl}/uploads/${data.userID.image}` : '/media/noavatar.png')}
                alt="user avatar"
              />
              <span>{data?.userID?.username}</span>
              {averageStars > 0 && (
                <div className="stars">
                  {new Array(Math.round(averageStars)).fill().map((_, i) => (
                    <img src="/media/star.png" key={i} alt="star" />
                  ))}
                  <span>{averageStars.toFixed(1)} ({totalReviewsCount})</span>
                </div>
              )}
            </div>
            
            <div className="custom-slider">
              {data?.images && data.images.length > 0 && (
                <img src={data.images[currentSlide]} alt="portfolio" className="main-slide-img" />
              )}
              {data?.images && data.images.length > 1 && (
                <>
                  <button className="slide-arrow prev" onClick={prevSlide}>‹</button>
                  <button className="slide-arrow next" onClick={nextSlide}>›</button>
                </>
              )}
            </div>

            <div className="gig-description-block" style={{ marginTop: "30px", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "22px", color: "#404145", marginBottom: "15px", fontWeight: "600" }}>Описание услуги</h2>
              <p style={{ fontSize: "16px", color: "#62646a", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {data?.description || "Описание исполнителем не указано."}
              </p>
            </div>
            
            <div className="order-block">
              <div className="price-row">
                <h3>{data?.title}</h3>
                <h2>
                  {data?.price?.toLocaleString('ru-RU', {
                    maximumFractionDigits: 0,
                    style: 'currency',
                    currency: 'RUB',
                  })}
                </h2>
              </div>
              <div className="details-row">
                <div className="item">
                  <img src="/media/star.png" alt="Срок" style={{ filter: 'hue-rotate(90deg)', width: '16px', height: '16px' }} /> 
                  <span>Срок выполнения: {data?.deliveryTime} дн.</span>
                </div>
                <div className="item">
                  <img src="/media/star.png" alt="Правки" style={{ filter: 'hue-rotate(220deg)', width: '16px', height: '16px' }} />
                  <span>Доступно правок: {data?.revisionNumber}</span>
                </div>
              </div>
              <div className="features-list">
                {data?.features?.map((feature) => (
                  <div key={feature} className="feature-item">
                    <img src="/media/star.png" alt="check" style={{ width: '10px', height: '10px' }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 3, 6): Запрещаем самовыкуп. 
                  Если это собственная услуга, кнопка блокируется, иначе — доступна для всех, включая других исполнителей */}
              {isOwner ? (
                <button 
                  className="order-btn disabled-owner-btn" 
                  disabled 
                  style={{ backgroundColor: "#b5b5b5", cursor: "not-allowed" }}
                  title="Вы не можете приобрести собственную услугу"
                >
                  Собственный продукт
                </button>
              ) : (
                <Link to={`/pay/${_id}`}>
                  <button className="order-btn">Заказать услугу</button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="right-panel">
            <div className="seller">
              <h2>Об исполнителе</h2>
              <div className="user-info">
                <img src={data?.userID?.image?.startsWith('http') ? data.userID.image : (data?.userID?.image ? `${backendUrl}/uploads/${data.userID.image}` : '/media/noavatar.png')} alt="" />
                <div className="info">
                  <span className="username-text">{data?.userID?.username}</span>
                  {averageStars > 0 ? (
                    <div className="stars">
                      {new Array(Math.round(averageStars)).fill().map((_, i) => (
                        <img src="/media/star.png" key={i} alt="star" />
                      ))}
                      <span>{averageStars.toFixed(1)} ({totalReviewsCount})</span>
                    </div>
                  ) : (
                    <div className="stars">
                      <img src="/media/star.png" alt="" />
                      <span>Новый исполнитель</span>
                    </div>
                  )}
                  
                {/* ИСПРАВЛЕНО ДЛЯ ВКР: Запрет отправки сообщения самому себе */}
                  <button 
                    className="contact-action-btn" 
                    onClick={handleContactClick} 
                    disabled={conversationMutation.isLoading || isOwner}
                    style={isOwner ? { backgroundColor: "#f5f5f5", color: "#b5b5b5", cursor: "not-allowed", border: "1px solid #ddd" } : {}}
                  >
                    {isOwner ? 'Ваш профиль' : (conversationMutation.isLoading ? 'Открытие...' : 'Связаться')}
                  </button>
                </div>
              </div>
              <div className="box">
                <div className="items">
                  <div className="item">
                    <span className="title">Страна</span>
                    <span className="desc">
                      {data?.userID?.country || 'Russia'}
                      {country?.normal && (
                        <span className='flag'>
                          <img src={country.normal} alt="flag" />
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="item">
                    <span className="title">На сайте с</span>
                    <span className="desc">
                      {data?.userID?.createdAt ? (
                        MONTHS[new Date(data.userID.createdAt).getMonth()] + ' ' + new Date(data.userID.createdAt).getFullYear()
                      ) : 'Июн 2026'}
                    </span>
                  </div>
                  <div className="item">
                    <span className="title">Последний заказ</span>
                    <span className="desc">{getLastOrderTime()}</span>
                  </div>
                  <div className="item">
                    <span className="title">Языки</span>
                    <span className="desc">Русский</span>
                  </div>
                </div>
                {data?.userID?.description && data.userID.description.trim() !== '' && (
                  <div className="author-bio-quote">
                    <p className="bio">{data.userID.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <Reviews gigID={_id} currentUserID={currentUser?._id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gig;