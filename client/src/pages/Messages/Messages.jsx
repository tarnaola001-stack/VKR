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

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const { isLoading, error, data } = useQuery({
    queryKey: ['conversations'],
    queryFn: () =>
      axiosFetch.get(`/conversations`)
        .then(({ data }) => data)
        .catch(({ response }) => {
          toast.error(response?.data?.message || 'Ошибка загрузки диалогов');
        })
  });

  const mutation = useMutation({
    mutationFn: (conversationID) => axiosFetch.put(`/conversations/${conversationID}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    }
  });

  const handleConversationClick = (conversationID) => {
    mutation.mutate(conversationID);
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
              const isCurrentUserSeller = conversation.sellerID?._id === user._id || conversation.sellerID === user._id;
              const isUnread = isCurrentUserSeller ? !conversation.readBySeller : !conversation.readByBuyer;
              const partner = isCurrentUserSeller ? conversation.buyerID : conversation.sellerID;
              const partnerAvatar = partner?.image || partner?.img;
              
              const avatarUrl = partnerAvatar 
                ? (partnerAvatar.startsWith('http') || partnerAvatar.startsWith('/media/') ? partnerAvatar : `http://localhost:8080/uploads/${partnerAvatar}`)
                : '/media/noavatar.png';

              return (
                <Link 
                  to={`/message/${conversation.conversationID}`} 
                  className={`conversation-item ${isUnread ? 'unread' : ''}`}
                  key={conversation.conversationID}
                  onClick={() => handleConversationClick(conversation.conversationID)}
                  style={{ display: "flex", alignItems: "center", padding: "15px", borderBottom: "1px solid #efeff2", textDecoration: "none", color: "inherit" }}
                >
                  <div className="avatar-block" style={{ marginRight: "15px" }}>
                    <img src={avatarUrl} alt="avatar" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                  </div>
                  <div className="info-block" style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div className="info-header" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="username" style={{ fontWeight: "700", color: "#404145" }}>{partner?.username || "Пользователь"}</span>
                      {/* ВЫВОД ТЕМЫ ДИАЛОГА В ФОРМЕ СПИСКА СООБЩЕНИЙ */}
                      <span className="theme-badge" style={{ fontSize: "11px", backgroundColor: "#e8faf0", color: "#1dbf73", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>
                        Тема: {conversation.title || "Обсуждение заказа"}
                      </span>
                    </div>
                    <p className="last-message" style={{ margin: 0, fontSize: "14px", color: isUnread ? "#222" : "#74767e", fontWeight: isUnread ? "600" : "400" }}>
                      {conversation.lastMessage || 'Нет сообщений. Нажмите, чтобы начать диалог.'}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="status-block">
                      <span className="unread-dot" style={{ width: "10px", height: "10px", backgroundColor: "#1dbf73", borderRadius: "50%", display: "block" }}></span>
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
