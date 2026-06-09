import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosFetch, generateImageURL } from '../../../utils'; // Импортируем утилиту загрузки изображений
import './Register.scss';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null); // Состояние для файла аватара
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

        if (formInput.isSeller) {
            if (!formInput.phone || formInput.phone.trim().length < 9) {
                toast.error('Для аккаунта исполнителя укажите корректный номер телефона!');
                return;
            }
        }

        setLoading(true);
        try {
            // Если пользователь выбрал файл, загружаем его через готовую утилиту, иначе ставим заглушку
            let finalImageUrl = "/media/noavatar.png";
            if (file) {
                const uploadRes = await generateImageURL(file);
                if (uploadRes?.url) {
                    finalImageUrl = uploadRes.url;
                }
            }
            
            const payload = {
                ...formInput,
                phone: formInput.isSeller ? formInput.phone : "",
                description: formInput.isSeller ? formInput.description : "",
                img: finalImageUrl, 
                image: finalImageUrl, // Дублируем для полной совместимости со схемами
                country: "Russia" 
            };

            await axiosFetch.post('/auth/register', payload);
            
            toast.success('Регистрация успешно завершена!');
            setLoading(false);
            navigate('/login');
        }
        catch (error) {
            const serverMessage = error.response?.data?.message || error.message || 'Произошла ошибка при регистрации';
            toast.error("Ошибка сервера: " + serverMessage);
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
                    <label htmlFor="username">Имя пользователя</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Студент"
                        onChange={handleChange}
                    />
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@mail.ru"
                        onChange={handleChange}
                    />
                    <label htmlFor="password">Пароль</label>
                    <input 
                        id="password"
                        name="password" 
                        type="password" 
                        placeholder='****' 
                        onChange={handleChange} 
                    />
                    
                    {/* ДОБАВЛЕНО ДЛЯ ВКР: Поле загрузки фотографии профиля */}
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
                        <label htmlFor="isSeller">Аккаунт для исполнителя</label>
                        <label className="switch">
                            <input id="isSeller" type="checkbox" name='isSeller' onChange={handleChange} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <label htmlFor="phone">Номер телефона</label>
                    <input
                        id="phone"
                        name="phone"
                        type="text"
                        placeholder="+7 (XXX) XXX-XX-XX"
                        onChange={handleChange}
                        disabled={!formInput.isSeller}
                    />
                    <label htmlFor="description">О себе</label>
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
