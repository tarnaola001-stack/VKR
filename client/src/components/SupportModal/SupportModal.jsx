import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './SupportModal.scss';

const SupportModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null; // Если окно закрыто, ничего не рендерим

  const handleSubmit = (e) => {
    e.preventDefault();

    // Базовая валидация на фронтенде
    if (!email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Пожалуйста, заполните все поля формы');
      return;
    }

    setLoading(true);

    // Имитация отправки запроса на бэкенд (для MVP этого более чем достаточно)
    setTimeout(() => {
      setLoading(false);
      toast.success('Заявка в техподдержку успешно отправлена!');
      
      // Очищаем форму
      setEmail('');
      setSubject('');
      setMessage('');
      
      // Закрываем модальное окно
      onClose();
    }, 1500);
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" onClick={onClose}>&times;</button>
        <h2>Служба технической поддержки</h2>
        
        {/* ИСПРАВЛЕНО ДЛЯ ВКР: Выведена почта для прямой связи с институтом */}
        <p>
          Опишите вашу проблему, и наш специалист свяжется с вами в течение 15 минут. 
          Прямой адрес для обращений: <strong>student_nvgu@maul.ru</strong>
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* ИСПРАВЛЕНО ДЛЯ ВКР: Технический маркер-адресат для демонстрации логики маршрутизации на бэкенде */}
          <input type="hidden" name="to_email" value="tarnaola00@mail.ru" />

          <label>Ваш Email для связи</label>
          <input 
            type="email" 
            placeholder="student_nvgu@mail.ru" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />

          <label>Тема обращения</label>
          <input 
            type="text" 
            placeholder="Например: Ошибка при оплате заказа" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
          />

          <label>Подробное описание проблемы</label>
          <textarea 
            rows="5" 
            placeholder="Пожалуйста, опишите вашу проблему как можно подробнее..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <button type="submit" disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportModal;
