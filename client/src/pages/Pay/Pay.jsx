import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { axiosFetch } from '../../utils';
import './Pay.scss';

const Pay = () => {
  const { _id } = useParams();
  const navigate = useNavigate();
  
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success
  const [processingStep, setProcessingStep] = useState('');
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').substring(0, 16);
      const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
      setCardData(prev => ({ ...prev, cardNumber: formatted }));
    } 
    else if (name === 'cardExpiry') {
      const digits = value.replace(/\D/g, '').substring(0, 4);
      let formatted = digits;
      if (digits.length > 2) {
        formatted = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
      }
      setCardData(prev => ({ ...prev, cardExpiry: formatted }));
    } 
    else if (name === 'cardCvc') {
      const digits = value.replace(/\D/g, '').substring(0, 3);
      setCardData(prev => ({ ...prev, cardCvc: digits }));
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (cardData.cardNumber.length !== 19) {
      return toast.error('Номер карты должен содержать ровно 16 цифр!');
    }

    if (cardData.cardExpiry.length !== 5) {
      return toast.error('Укажите срок действия карты в формате ММ/ГГ!');
    }
    
    const [month, year] = cardData.cardExpiry.split('/');
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (parsedMonth < 1 || parsedMonth > 12) {
      return toast.error('Некорректный месяц в сроке действия (должен быть от 01 до 12)!');
    }

    if (parsedYear < 26) {
      return toast.error('Срок действия карты истек! Пожалуйста, используйте актуальную рабочую карту.');
    }

    if (cardData.cardCvc.length !== 3) {
      return toast.error('Код безопасности CVC должен содержать ровно 3 цифры!');
    }

    setPaymentStatus('processing');
    
    try {
      setProcessingStep('Шифрование данных и создание сессии эквайринга...');
      await new Promise(res => setTimeout(res, 1000));

      setProcessingStep('Установление защищенного соединения с НСПК МИР...');
      await new Promise(res => setTimeout(res, 1000));

      setProcessingStep('Проверка баланса и авторизация транзакции банком-эмитентом...');
      await new Promise(res => setTimeout(res, 1000));

      // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 1, 1.2): Реальный запрос создания документа заказа в коллекции СУБД MongoDB.
      // Метод генерирует запись связки "заказчик-исполнитель" для корректного заполнения таблицы заказов.
      await axiosFetch.post(`/orders/${_id}`);

      // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 1): Полностью русифицированный интерфейс успешного платежа
      setProcessingStep('Платеж успешно выполнен! Перенаправление в личный кабинет...');
      setPaymentStatus('success');
      toast.success('Оплата успешно принята фриланс-платформой!');
      
      // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 1, 1.1): Маршрутизация перестроена строго на страницу активных заказов
      setTimeout(() => {
        navigate('/orders');
      }, 1500);

    } catch (error) {
      console.error(error);
      setPaymentStatus('idle');
      toast.error(error.response?.data?.message || 'Ошибка платежного шлюза СУБД. Попробуйте еще раз.');
    }
  };

  // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 1): Русифицированный интерфейс лоадера и экрана успеха транзакции
  if (paymentStatus === 'processing' || paymentStatus === 'success') {
    return (
      <div className="pay-processing-container">
        <div className="processing-card">
          <div className="payment-spinner"></div>
          <h2>Безопасная оплата услуг</h2>
          <p className="step-text" style={{ fontWeight: "500", color: "#1dbf73" }}>{processingStep}</p>
          <small className="wkr-badge">Шлюз ПАО МИР / СБП • Демо-режим защиты ВКР</small>
        </div>
      </div>
    );
  }

  return (
    <div className='pay-page-wrapper'>
      <div className="pay-billing-card">
        <div className="billing-header">
          <h2>Тестовый платежный шлюз</h2>
          <span className="wkr-indicator">Демо-режим платформы</span>
        </div>

        <form onSubmit={handlePaymentSubmit} className="payment-wkr-form">
          <div className="bank-card-layout">
            <div className="card-side front">
              <div className="card-chip-row">
                <div className="emv-chip"></div>
                <div className="card-logo-type">MIR / VISA</div>
              </div>
              
              <div className="form-field">
                <label htmlFor="cardNumber">НОМЕР КАРТЫ</label>
                <input
                  id="cardNumber"
                  type="text"
                  name="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.cardNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="card-footer-row">
                <div className="form-field expiry-field">
                  <label htmlFor="cardExpiry">СРОК ДЕЙСТВИЯ</label>
                  <input
                    id="cardExpiry"
                    type="text"
                    name="cardExpiry"
                    placeholder="ММ/ГГ"
                    value={cardData.cardExpiry}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-field cvc-field">
                  <label htmlFor="cardCvc">CVC / CVV</label>
                  <input
                    id="cardCvc"
                    type="password"
                    name="cardCvc"
                    placeholder="000"
                    value={cardData.cardCvc}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="payment-action-submit-btn">
            Подтвердить и оплатить услугу
          </button>
        </form>
      </div>
    </div>
  );
};

export default Pay;
