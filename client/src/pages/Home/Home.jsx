import { useState, useEffect } from 'react';
import { Featured, Slide } from '../../components';
import { CategoryCard } from '../../components';
import SupportModal from '../../components/SupportModal/SupportModal';
import { cards } from '../../data';
import './Home.scss';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='home'>
      <Featured />
      <div className="categorySliderWrapper">
        <Slide slidesToShow={5}>
          {cards.map((card) => (
            <CategoryCard key={card.id} data={card} />
          ))}
        </Slide>
      </div>
      <div className="features">
        <div className="container">
          <div className="item">
            <h1>Мир фриланса в вашем распоряжении</h1>
            <div className="title">
              <img src="./media/check.png" alt="check" />
              <h6>Лучшие предложения под любой бюджет</h6>
            </div>
            <p>Найдите высококачественные услуги в любой ценовой категории.</p>
            <div className="title">
              <img src="./media/check.png" alt="check" />
              <h6>Качественная работа, быстрое выполнение</h6>
            </div>
            <p>Найдите подходящего фрилансера, чтобы начать работу над вашим проектом за считанные минуты.</p>
            <div className="title">
              <img src="./media/check.png" alt="check" />
              <h6>Гарантированная сохранность ваших средств при каждой оплате.</h6>
            </div>
            <p>Точная стоимость известна заранее. Выплаты — только за утвержденный результат.</p>
            <div className="title">
              <img src="./media/check.png" alt="check" />
              <h6>Всегда на связи</h6>
            </div>
            <p>При наличии вопросов наша служба поддержки готова помочь!</p>
          </div>
          <div className="item visual-block">
            <img src="/media/travel-nomad.png" alt="Работа из любой точки мира" className="main-feat-img" />
            <div className="image-gradient-overlay">
              <h3>Работайте из любой точки мира</h3>
              <p>Ваш офис там, где есть internet. Объединяем заказчиков и исполнителей по всей России.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="features dark text-center-banner">
        <div className="container">
          <div className="item banner-content">
            <h2>Центр помощи пользователям</h2>
            <h1>Возникли вопросы или технические проблемы?</h1>
            <p className="subtitle">Наша единая служба поддержки готова оперативно помочь в решении любых технических и организационных вопросов, возникающих в процессе работы на платформе.</p>
            <div className="badge-list">
              <div className="title">
                <img src="./media/check.png" alt="check" />
                <h6>Круглосуточный мониторинг транзакций и заказов</h6>
              </div>
              <div className="title">
                <img src="./media/check.png" alt="check" />
                <h6>Прямая связь со специалистами технического отдела</h6>
              </div>
              <div className="title">
                <img src="./media/check.png" alt="check" />
                <h6>Помощь в разрешении любых спорных ситуаций</h6>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(true)}>Связаться с техподдержкой</button>
          </div>
        </div>
      </div>
      
      {/* ИСПРАВЛЕНО ДЛЯ ВКР: Весь проблемный блок витрины/слайдера удален во избежание сбоев рендеринга */}

      <SupportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Home;
