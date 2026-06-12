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

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get(`/conversations`).then(({ data }) => data),
    enabled: !!user,
    refetchInterval: 5000
  });

  // ИСПРАВЛЕНО (Пункт 3 ТЗ): Контекстный подсчет непрочитанных чатов по ID участников, а не по типу аккаунта
  const unreadCount = conversations 
    ? conversations.filter(c => {
        const isUserSellerInChat = c.sellerID?._id === user?._id || c.sellerID === user?._id;
        return isUserSellerInChat ? !c.readBySeller : !c.readByBuyer;
      }).length
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

  const menuLinks = [
    { path: "/gigs?cat=programming", name: "Разработка и IT" },
    { path: "/gigs?cat=design", name: "Графика и дизайн" },
    { path: "/gigs?cat=video", name: "Видео и анимация" },
    { path: "/gigs?cat=writing", name: "Тексты и переводы" },
    { path: "/gigs?cat=marketing", name: "Маркетинг и SMM" },
    { path: "/gigs?cat=music", name: "Аудио и музыка" },
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
              {!user && (
                <span>
                  <Link to="/login" className="link">
                    Войти
                  </Link>
                </span>
              )}
              {!user && (
                <button
                  className={showMenu || pathname !== "/" ? "join active" : ""}
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
                  <div className="avatar-wrapper" style={{ position: "relative", display: "inline-block" }}>
                    <img src={getAvatarUrl()} alt="avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                    {/* КРАСНЫЙ КРУЖОК-ИНДИКАТОР УВЕДОМЛЕНИЙ НА АВАТАРКЕ */}
                    {unreadCount > 0 && (
                      <span className="nav-unread badge" style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", backgroundColor: "#ff3b30", borderRadius: "50%", border: "2px solid #fff" }}></span>
                    )}
                  </div>
                  <span className="nav username" style={{ marginLeft: "10px", cursor: "pointer" }}>{user?.username}</span>
                  {showPanel && (
                    <div className="options">
                      <Link className="link" to="/profile">
                        Настройки профиля
                      </Link>
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
