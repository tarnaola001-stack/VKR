import Slider from "react-slick";
import toast from 'react-hot-toast';
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { useQuery } from '@tanstack/react-query';
import { axiosFetch } from "../../utils";
import { useRecoilState } from "recoil";
import { userState } from "../../atoms";
import { Loader } from "..";
import "./Navbar.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userState);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoinHovered, setIsJoinHovered] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosFetch.get('/auth/me');
        setUser(data.user);
      }
      catch({ response }) {
        localStorage.removeItem('user');
        console.log(response?.data?.message || "Пользователь не авторизован");
      }
      finally {
        setIsLoading(false);
      }
    })();
  }, [setUser]);

  // Запрос диалогов для вычисления счетчика непрочитанных
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get(`/conversations`).then(({ data }) => data),
    enabled: !!user,
    refetchInterval: 5000 
  });

  // Вычисляем количество непрочитанных диалогов
  const unreadCount = conversations 
    ? conversations.filter(c => (user?.isSeller ? !c.readBySeller : !c.readByBuyer)).length 
    : 0;

  const isActive = () => {
    window.scrollY > 0 ? setShowMenu(true) : setShowMenu(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  // Синхронизированные слаги категорий для РФ-рынка (ВКР)
  const menuLinks = [
    { path: "/gigs?cat=programming", name: "Разработка и IT" },
    { path: "/gigs?cat=design", name: "Графика и дизайн" },
    { path: "/gigs?cat=video", name: "Видео и анимация" },
    { path: "/gigs?cat=books", name: "Тексты и переводы" },
    { path: "/gigs?cat=social", name: "Маркетинг и SMM" },
    { path: "/gigs?cat=voice", name: "Аудио и музыка" },
    { path: "/gigs?cat=ai", name: "Нейросети и ИИ" },
    { path: "/gigs?cat=business", name: "Бизнес и консалтинг" },
  ];

  const settings = {
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 2,
    prevArrow: <GrFormPrevious />,
    nextArrow: <GrFormNext />,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  const handleLogout = async () => {
    try {
      await axiosFetch.post("/auth/logout");
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Вы успешно вышли из системы');
      navigate("/");
    } catch ({ response }) {
      console.log(response?.data);
    }
  };

  const getAvatarUrl = () => {
    const avatar = user?.image || user?.img;
    if (!avatar) return "/media/noavatar.png";
    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/media/")) {
      return avatar;
    }
    return `http://localhost:8080/uploads/${avatar}`;
  };

  return (
    <nav className={showMenu || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        <div className="logo">
          <Link to="/" className="link">
            <span className="text">FreelancePF</span>
          </Link>
          <span className="dot">.</span>
        </div>
        <div className="links">
          {isLoading ? (
            <Loader size={35} />
          ) : (
            <>
              {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункты 9 и 10): Ссылка "Стать исполнительской" полностью удалена из шапки, 
                  чтобы избежать несанкционированного получения прав доступа обычными пользователями */}
              {!user && (
                <span>
                  <Link to="/login" className="link">
                    Войти
                  </Link>
                </span>
              )}
              {!user && (
                <button
                  className={showMenu || pathname !== "/" ? "join-active" : ""}
                  onMouseEnter={() => setIsJoinHovered(true)}
                  onMouseLeave={() => setIsJoinHovered(false)}
                >
                  <Link 
                    to="/register" 
                    className="link"
                    style={{ 
                      color: isJoinHovered 
                        ? '#ffffff' 
                        : (showMenu || pathname !== "/" ? '#1DBF73' : '#ffffff'), 
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'block',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    Регистрация
                  </Link>
                </button>
              )}
              {user && (
                <div className="user" onClick={() => setShowPanel(!showPanel)}>
                  <div className="avatar-wrapper">
                    <img src={getAvatarUrl()} alt="avatar" />
                    {unreadCount > 0 && <span className="nav-unread-badge"></span>}
                  </div>
                  <span className="nav-username">{user?.username}</span>
                  {showPanel && (
                    <div className="options">
                      <Link className="link" to="/profile">
                        Настройки профиля
                      </Link>
                      {/* Строгая проверка прав: окно добавления услуг доступно ТОЛЬКО реальным исполнителям из БД */}
                      {user?.isSeller && (
                        <>
                          <Link className="link" to="/my-gigs">
                            Мои услуги
                          </Link>
                          <Link className="link" to="/add">
                            Создать услугу
                          </Link>
                        </>
                      )}
                      <Link className="link" to="/orders">
                        Заказы
                      </Link>
                      <Link className="link" to="/messages">
                        Сообщения {unreadCount > 0 && `(${unreadCount})`}
                      </Link>
                      <span className="link" onClick={handleLogout} style={{cursor: 'pointer'}}>
                        Выйти
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {(showMenu || pathname !== "/") && (
        <>
          <hr />
          <Slider className="menu" {...settings}>
            {menuLinks.map(({ path, name }) => (
              <div key={name} className="menu-item">
                <Link className="link" to={path}>
                  {name}
                </Link>
              </div>
            ))}
          </Slider>
        </>
      )}
    </nav>
  );
};

export default Navbar;
