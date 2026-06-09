import toast from 'react-hot-toast';
import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from "recoil";
import { userState } from "../../atoms";
import { axiosFetch } from '../../utils';
import { Loader } from '../../components';
import "./Message.scss";

const Message = () => {
  const user = useRecoilValue(userState);
  const { conversationID } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Защита роута. Если пользователь вышел, плавно перенаправляем его на главную
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Запрос истории сообщений в диалоге [INDEX]
  const { isLoading: isMessagesLoading, error: messagesError, data: messagesData } = useQuery({
    queryKey: ['messages', conversationID],
    queryFn: () =>
      axiosFetch.get(`/messages/${conversationID}`)
        .then(({ data }) => data)
        .catch(({ response }) => {
          toast.error(response?.data?.message || "Ошибка загрузки сообщений");
        })
  });

  // Запрос самого диалога для проверки статуса прочтения (вывода галочек) [INDEX]
  const { data: conversationData } = useQuery({
    queryKey: ['conversation', conversationID],
    queryFn: () =>
      axiosFetch.get(`/conversations`)
        .then(({ data }) => data.find(c => c.id === conversationID))
        .catch(() => null),
    refetchInterval: 3000 // Фоновое обновление статуса прочтения каждые 3 секунды
  });
  
  const mutation = useMutation({
    mutationFn: (message) => 
      axiosFetch.post('/messages', message),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['conversations']);
      queryClient.invalidateQueries(['conversation', conversationID]);
    }
  });

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const textValue = textarea?.value?.trim();
    
    if (!user || !textValue) return;

    mutation.mutate({
      conversationID,
      description: textValue
    });

    event.target.reset();
  };

  // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 4): Логика вывода одинарной серой и двойной зеленой галочки
  const renderCheckmarks = () => {
    if (!conversationData) return <span className="checkmarks unread" style={{ color: "#a6a6a6" }}>✓</span>;
    
    // Определяем, прочитано ли последнее сообщение противоположной стороной [INDEX]
    const isReadByPartner = user?.isSeller ? conversationData.readByBuyer : conversationData.readBySeller;
    
    return isReadByPartner ? (
      /* Двойная зеленая галочка — сообщение прочитано собеседником (в тон к стилю сайта) */
      <span className="checkmarks read" style={{ color: "#1dbf73", fontWeight: "bold", fontSize: "14px" }}>✓✓</span>
    ) : (
      /* Одна серая галочка — сообщение доставлено, но еще не открыто собеседником */
      <span className="checkmarks unread" style={{ color: "#a6a6a6", fontSize: "14px" }}>✓</span>
    );
  };

  if (!user) return <div className="loader"><Loader /></div>;

  return (
    <div className="message">
      <div className="container">
        {/* Панель навигации с кнопкой «Назад» и хлебными крошками */}
        <div className="navigation-panel">
          <button className="back-btn" onClick={() => navigate("/messages")}>
            <span className="arrow">←</span> Назад
          </button>
          <span className="breadcrumbs">
            <Link to="/" className="link">Главная</Link> &gt; <Link to="/messages" className="link">Сообщения</Link> &gt; Диалог
          </span>
        </div>

        {/* Выделенное квадратное окно (чат-бокс) для вывода сообщений */}
        <div className="chat-box">
          {
            isMessagesLoading
              ? <div className="loader"> <Loader /> </div>
              : messagesError
                ? <div className="error-msg">What's wrong?</div>
                : <div className="messages">
                  {
                    messagesData && messagesData.map((message) => {
                      const isOwner = message.userID?._id === user?._id;

                      return (
                        <div className={isOwner ? 'owner item' : 'item'} key={message._id}>
                          <img
                            src={message.userID?.image || message.userID?.img || '/media/noavatar.png'}
                            alt="avatar"
                          />
                          <div className="message-content">
                            <p>{message.description}</p>
                            
                            {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 4): Английская надпись "a few seconds ago" полностью удалена, 
                                оставлен только вывод аккуратных графических статусных галочек автора */}
                            {isOwner && (
                              <div className="status-wrapper" style={{ display: "flex", justifyContent: "flex-end", marginTop: "2px" }}>
                                {renderCheckmarks()}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  }
                  {messagesData && messagesData.length === 0 && (
                    <div className="empty-chat">В этом диалоге пока нет сообщений. Напишите первое!</div>
                  )}
                </div>
          }
        </div>

        <hr />
        
        {/* Русифицированная форма отправки с фиксированной разметкой */}
        <form className="write" onSubmit={handleMessageSubmit}>
          <textarea cols="30" rows="4" placeholder="Напишите сообщение..."></textarea>
          <div className="btn-wrapper">
            <button type='submit' disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Message;
