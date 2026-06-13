import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosFetch, generateImageURL } from '../../../utils'; 
import './Register.scss';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null); 
  const [formInput, setFormInput] = useState({
    username: "",
    email: "",
    password: "",
    phone: '',
    description: '',
    isSeller: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formInput.username || !formInput.email || !formInput.password) {
      toast.error('Пожалуйста, заполните обязательные поля: Имя, Email и Пароль!');
      return;
    }

    if (formInput.isSeller && formInput.phone.trim().length > 0) {
      if (formInput.phone.trim().length < 9) {
        toast.error('Укажите корректный номер телефона или оставьте поле пустым!');
        return;
      }
    }

    setLoading(true);
    try {
      let finalImageUrl = "/media/noavatar.png";
      if (file) {
        const uploadRes = await generateImageURL(file);
        if (uploadRes?.url) {
          finalImageUrl = uploadRes.url;
        }
      }

      const payload = {
        ...formInput,
        phone: formInput.phone || "",
        description: formInput.description || "",
        img: finalImageUrl, 
        image: finalImageUrl, 
        country: "Russia"
      };

      await axiosFetch.post('/auth/register', payload);

      toast.success('Регистрация успешно завершена!');
      setLoading(false);
      navigate('/login');
    }
    catch (error) {
      const serverMessage = error.response?.data?.message || error.message || 'Произошла ошибка при регистрации';
      toast.error("Ошибка: " + serverMessage);
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { value, name, type, checked } = event.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormInput({
      ...formInput,
      [name]: inputValue
    });
  };

  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="left">
          <h1>Создать аккаунт</h1>
          <label htmlFor="username">Имя пользователя <span style={{color: 'red'}}>*</span></label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Студент"
            onChange={handleChange}
          />
          <label htmlFor="email">Email <span style={{color: 'red'}}>*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="example@mail.ru"
            onChange={handleChange}
          />
          <label htmlFor="password">Пароль <span style={{color: 'red'}}>*</span></label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder='****'
            onChange={handleChange}
          />

          <label htmlFor="avatar">Фотография профиля</label>
          <input
            id="avatar"
            type="file"
            className="file-input"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </div>
        <div className="right">
          <p>Уже есть аккаунт? <Link to='/login'>Авторизоваться</Link></p>
          <h1>Я хочу стать исполнителем</h1>
          <div className="toggle">
            <label htmlFor="isSeller">Аккаунт исполнителя</label>
            <label className="switch">
              <input id="isSeller" type="checkbox" name='isSeller' onChange={handleChange} />
              <span className="slider round"></span>
            </label>
          </div>
          {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 3 ТЗ): Поля динамически блокируются, если тумблер выключен */}
          <label htmlFor="phone" style={{ opacity: formInput.isSeller ? 1 : 0.5 }}>Номер телефона</label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="+7 (XXX) XXX-XX-XX"
            onChange={handleChange}
            disabled={!formInput.isSeller} 
          />
          <label htmlFor="description" style={{ opacity: formInput.isSeller ? 1 : 0.5 }}>О себе (необязательно)</label>
          <textarea
            placeholder="Расскажите что-нибудь о себе"
            name="description"
            id="description"
            cols="30"
            rows="10"
            onChange={handleChange}
            disabled={!formInput.isSeller} 
          ></textarea>
        </div>
      </form>
    </div>
  );
};

export default Register;
