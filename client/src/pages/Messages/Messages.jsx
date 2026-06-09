import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { userState } from '../../atoms';
import { axiosFetch } from '../../utils';
import { Loader } from '../../components';
import './Messages.scss';

const Messages = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Безопасный редирект. Если пользователь вышел, плавно отправляем на главную
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Получение списка диалогов текущего пользователя [INDEX]
  const { isLoading, error, data } = useQuery({
    queryKey: ['conversations'],
    queryFn: () =>
      axiosFetch.get(`/conversations`)
        .then(({ data }) => {
          return data;
        })
        .catch(({ response }) => {
          toast.error(response?.data?.message || 'Ошибка загрузки диалогов');
        })
  });

  // Мутация для автоматической пометки диалога как прочитанного при клике на него
  const mutation = useMutation({
    mutationFn: (id) => axiosFetch.put(`/conversations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    }
  });

  const handleConversationClick = (id) => {
    mutation.mutate(id);
  };

  if (!user) return <div className="loader"><Loader /></div>;

  return (
    <div className="messages-page">
      <div className="container">
        <div className="title">
          <h1>Сообщения</h1>
        </div>
        
        {isLoading ? (
          <div className="loader">
            <Loader />
          </div>
        ) : error ? (
          <div className="error-message">Не удалось загрузить список сообщений!</div>
        ) : (
          <div className="conversations-list">
            {data && data.map((conversation) => {
              // Определяем, является ли диалог непрочитанным для текущего аккаунта
              const isUnread = (user?.isSeller && !conversation.readBySeller) || 
                               (!user?.isSeller && !conversation.readByBuyer);

              // Извлекаем данные собеседника в зависимости от роли (Исполнитель или Заказчик) [INDEX]
              const partner = user?.isSeller ? conversation.buyerID : conversation.sellerID;
              
              // Безопасный путь к аватарке собеседника
              const partnerAvatar = partner?.image || partner?.img;
              const avatarUrl = partnerAvatar 
                ? (partnerAvatar.startsWith('http') ? partnerAvatar : `http://localhost:8080/uploads/${partnerAvatar}`)
                : '/media/noavatar.png';

              return (
                <Link 
                  to={`/message/${conversation.id}`} 
                  className={`conversation-item ${isUnread ? 'unread' : ''}`}
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  {/* Левая часть: Аватарка собеседника */}
                  <div className="avatar-block">
                    <img src={avatarUrl} alt="avatar" />
                  </div>

                  {/* Центральная часть: Имя и превью текста последнего сообщения */}
                  <div className="info-block">
                    <div className="info-header">
                      <span className="username">{partner?.username || "Пользователь"}</span>
                      {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 4): Текстовый блок относительного времени (10 minutes ago) полностью вырезан */}
                    </div>
                    <p className="last-message">
                      {conversation.lastMessage || 'Нет сообщений. Нажмите, чтобы начать диалог.'}
                    </p>
                  </div>

                  {/* Правая часть: Зеленая точка-индикатор, если сообщение новое */}
                  {isUnread && (
                    <div className="status-block">
                      <span className="unread-dot"></span>
                    </div>
                  )}
                </Link>
              );
            })}
            
            {data && data.length === 0 && (
              <div className="empty-messages">У вас пока нет активных диалогов.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
