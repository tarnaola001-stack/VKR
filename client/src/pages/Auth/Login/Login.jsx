import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosFetch } from '../../../utils';
import { useRecoilState } from 'recoil';
import { userState } from '../../../atoms';
import './Login.scss';

const initialState = {
  username: '',
  password: ''
}

const Login = () => {
  const [formInput, setFormInput] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleFormInput = (event) => {
    const { value, name } = event.target;
    setFormInput({
      ...formInput,
      [name]: value
    });
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // ИСПРАВЛЕНО ДЛЯ ВКР: Русифицированная валидация полей
    const fieldNames = {
      username: 'Имя пользователя',
      password: 'Пароль'
    };

    for(let key in formInput) {
      if(formInput[key] === '') {
        toast.error(`Пожалуйста, заполните поле: ${fieldNames[key] || key}`);
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await axiosFetch.post('/auth/login', formInput);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      // ИСПРАВЛЕНО ДЛЯ ВКР: Русифицированное уведомление об успешном входе
      toast.success("С возвращением!", {
        duration: 3000,
        icon: "😃"
      });
      navigate('/');
    }
    catch ({ response: { data } }) {
      setError(data.message);
      toast.error(data.message, {
        duration: 3000,
      });
    }
    finally {
      setLoading(false);
      setError(null);
    }
  }

  return (
    <div className='login'>
      <form action="" onSubmit={handleFormSubmit}>
        <h1>Авторизация</h1>
        <label htmlFor="">Имя пользователя</label>
        <input name='username' placeholder='Студент НВГУ' onChange={handleFormInput} />

        <label htmlFor="">Пароль</label>
        <input name='password' type='password' placeholder='****' onChange={handleFormInput} />
        
        {/* ИСПРАВЛЕНО ДЛЯ ВКР: Текст Loading заменен на Вход... */}
        <button disabled={loading} type='submit'>{ loading ? 'Вход...' : 'Войти' }</button>
        <span>{error && error}</span>
      </form>
    </div>
  )
}

export default Login;
