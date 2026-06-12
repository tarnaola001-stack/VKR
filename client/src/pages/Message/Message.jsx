import toast from 'react-hot-toast';
import { useEffect, useState } from "react";
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
  const [chatTheme, setChatTheme] = useState("Обсуждение услуги");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate("/");
    }
    const savedTheme = localStorage.getItem(`theme_${conversationID}`);
    if (savedTheme) {
      setChatTheme(savedTheme);
    }
  }, [user, navigate, conversationID]);

  const { isLoading: isMessagesLoading, error: messagesError, data: messagesData } = 
  useQuery({
    queryKey: ['messages', conversationID],
    queryFn: () =>
      axiosFetch.get(`/messages/${conversationID}`)
        .then(({ data }) => data)
        .catch(({ response }) => {
          toast.error(response?.data?.message || "Ошибка загрузки сообщений");
        })
  });

  const { data: conversationData } = useQuery({
    queryKey: ['conversation', conversationID],
    queryFn: () =>
      axiosFetch.get(`/conversations`)
        .then(({ data }) => data.find(c => c.conversationID === conversationID))
        .catch(() => null),
    refetchInterval: 3000 
  });

  const readMutation = useMutation({
    mutationFn: () => axiosFetch.put(`/conversations/${conversationID}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    }
  });

  useEffect(() => {
    if (conversationID) {
      readMutation.mutate();
    }
  }, [conversationID]);

  const mutation = useMutation({
    mutationFn: (message) => axiosFetch.post('/messages', message),
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

  // ИСПРАВЛЕНО: Индивидуальный контроль галочек для каждого отдельного сообщения
  const renderCheckmarks = (message) => {
    if (!conversationData) return <span className="checkmarks unread" style={{ color: "#a6a6a6" }}>✓</span>;
    
    // Если сообщение прочитано в базе данных, либо комната помечена прочитанной партнером
    const isCurrentUserSellerInChat = conversationData.sellerID?._id === user?._id || conversationData.sellerID === user?._id;
    const isRoomReadByPartner = isCurrentUserSellerInChat ? conversationData.readByBuyer : conversationData.readBySeller;
    
    const isMessageRead = message.isRead || isRoomReadByPartner;

    return isMessageRead ? (
      <span className="checkmarks read" style={{ color: "#1dbf73", fontWeight: "bold", fontSize: "14px" }}>✓✓</span>
    ) : (
      <span className="checkmarks unread" style={{ color: "#a6a6a6", fontSize: "14px" }}>✓</span>
    );
  };

  if (!user) return <div className="loader"><Loader /></div>;

  return (
    <div className="message">
      <div className="container">
        <div className="navigation-panel">
          <button className="back-btn" onClick={() => navigate("/messages")}>
            <span className="arrow">←</span> Назад
          </button>
          <span className="breadcrumbs">
            <Link to="/" className="link">Главная</Link> &gt; <Link to="/messages" className="link">Сообщения</Link> &gt; {chatTheme}
          </span>
        </div>
        
        <div className="chat-theme-header" style={{ padding: "10px 15px", backgroundColor: "#fff", border: "1px solid #e4e5e7", borderRadius: "4px", marginBottom: "15px", fontSize: "14px", fontWeight: "600", color: "#1dbf73" }}>
          Тема: {chatTheme}
        </div>

        <div className="chat-box">
          {isMessagesLoading ? (
            <div className="loader"> <Loader /> </div>
          ) : messagesError ? (
            <div className="error-msg">Произошла ошибка при загрузке переписки!</div>
          ) : (
            <div className="messages">
              {messagesData && messagesData.map((message) => {
                const isOwner = message.userID?._id === user?._id || message.userID === user?._id;
                return (
                  <div className={isOwner ? 'owner item' : 'item'} key={message._id}>
                    <img
                      src={message.userID?.image || message.userID?.img || '/media/noavatar.png'}
                      alt="avatar"
                    />
                    <div className="message-content">
                      <p>{message.description}</p>
                      {isOwner && (
                        <div className="status-wrapper" style={{ display: "flex", justifyContent: "flex-end", marginTop: "2px" }}>
                          {/* Передаем объект конкретного сообщения */}
                          {renderCheckmarks(message)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {messagesData && messagesData.length === 0 && (
                <div className="empty-chat">В этом диалоге пока нет сообщений. Напишите первое!</div>
              )}
            </div>
          )}
        </div>
        <hr />
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
