import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState } from 'recoil';
import { userState } from '../../atoms';
import { axiosFetch, generateImageURL } from '../../utils';
import './Profile.scss';

const Profile = () => {
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  
  const [formData, setFormData] = useState({
    email: '',
    description: '',
    isSeller: false, // ДОБАВЛЕНО ДЛЯ ВКР: Состояние роли в форме
  });

  // Заполняем форму текущими данными пользователя при загрузке страницы
  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      setFormData({
        email: user.email || '',
        description: user.description || '',
        isSeller: user.isSeller || false, // ИСПРАВЛЕНО ДЛЯ ВКР
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      return toast.error('Поле Email не может быть пустым!');
    }

    setLoading(true);
    try {
      let avatarUrl = user?.image || user?.img || "/media/noavatar.png";

      // Если пользователь выбрал новый файл, загружаем его в хранилище через утилиту
      if (file) {
        const uploadRes = await generateImageURL(file);
        if (uploadRes?.url) {
          avatarUrl = uploadRes.url;
        }
      }

      const payload = {
        email: formData.email.trim(),
        description: formData.description.trim(),
        isSeller: formData.isSeller, // ИСПРАВЛЕНО ДЛЯ ВКР: Передаем роль на бэкенд
        image: avatarUrl,
        img: avatarUrl
      };

      // Отправляем запрос обновления на бэкенд по ID авторизованного аккаунта
      await axiosFetch.put(`/users/${user._id}`, payload);
      
      // Синхронизируем новое обновленное состояние в Recoil глобально на фронтенде
      setUser({
        ...user,
        email: payload.email,
        description: payload.description,
        isSeller: payload.isSeller, // ИСПРАВЛЕНО ДЛЯ ВКР: Мгновенное обновление меню
        image: avatarUrl,
        img: avatarUrl
      });

      toast.success('Профиль успешно обновлен!');
      setFile(null); // Сбрасываем выбранный файл после успешной загрузки
    } catch (error) {
      const msg = error.response?.data?.message || 'Не удалось обновить профиль';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Полноценный безопасный метод предварительного просмотра выбранного аватара
  const getAvatarPreview = () => {
    if (file) return URL.createObjectURL(file);
    const avatar = user?.image || user?.img;
    if (!avatar) return "/media/noavatar.png";
    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/media/")) {
      return avatar;
    }
    return `${backendUrl}/uploads/${avatar}`;
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Редактирование профиля</h1>
        <form onSubmit={handleSubmit}>
          <div className="avatar-section">
            <img src={getAvatarPreview()} alt="avatar preview" />
            <label htmlFor="avatar-upload" className="upload-btn">Изменить аватарку</label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])} 
              style={{ display: 'none' }} 
            />
          </div>

          <div className="input-group">
            <label>Имя пользователя (Логин)</label>
            <input type="text" value={user?.username || ''} disabled className="disabled-input" />
            <small>Смена логина невозможна по соображениям безопасности СУБД</small>
          </div>

          <div className="input-group">
            <label htmlFor="email">Электронная почта (Email)</label>
            <input 
              id="email"
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="example@mail.ru"
            />
            <small>Email необходим для фиксации финансовых операций и чеков заказов</small>
          </div>

          {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 9): Безопасный переключатель роли пользователя в личном кабинете */}
          <div className="input-group status-toggle-group">
            <label>Тип учетной записи платформы</label>
            <div className="toggle-wrapper">
              <span className="toggle-label">Режим исполнителя (Продавец услуг)</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  name="isSeller" 
                  checked={formData.isSeller} 
                  onChange={handleChange} 
                />
                <span className="slider round"></span>
              </label>
            </div>
            <small>Включение режима активирует разделы создания услуг и просмотра откликов</small>
          </div>

          <div className="input-group">
            <label htmlFor="description">О себе / Описание деятельности</label>
            <textarea 
              id="description"
              name="description" 
              rows="6" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="Расскажите о ваших навыках или предпочтениях при заказе услуг..."
            ></textarea>
          </div>

          <button type="submit" disabled={loading} className="save-btn">
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
