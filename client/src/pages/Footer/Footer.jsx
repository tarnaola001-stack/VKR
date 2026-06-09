import { useEffect } from 'react';
import './Footer.scss';

const Footer = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='footer'>
      <div className="container">
        {/* Сноска-разделитель */}
        <hr />
        <div className="bottom">
          <div className="left">
            <h2>FreelancePF<span>.</span></h2>
            <span>© Платформа FreelancePF. {new Date().getFullYear()}</span>
          </div>
          <div className="right">
            {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 7): В правой части сохранены только социальные сети, 
                а языковая панель и иконка монет/обозначения валют полностью удалены */}
            <div className="social">
              <img src="/media/vk.png" alt="ВКонтакте" />
              <img src="/media/telegramm.png" alt="Telegram" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
