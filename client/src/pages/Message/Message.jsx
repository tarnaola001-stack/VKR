import toast from 'react-hot-toast';
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from "recoil";
import { userState } from "../../atoms";
import { axiosFetch, generateImageURL, getImageUrl } from '../../utils';
import { Loader } from '../../components';
import "./Message.scss";

const Message = () => {
  const user = useRecoilValue(userState);
  const { conversationID } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [chatTheme, setChatTheme] = useState("Обсуждение услуги");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    const loadToast = toast.loading("Загрузка файлов...");
    try {
const uploadedUrls = await Promise.all(
  Array.from(files).map(async (file) => {
    const res = await generateImageURL(file);
    const url = res?.url || "";

    if (url.includes("/uploads/")) {
      return url.substring(url.lastIndexOf("/") + 1);
    }

    return url;
  })
);
      const validUrls = uploadedUrls.filter(url => url !== "");
      setAttachedFiles(prev => [...prev, ...validUrls]);
      toast.success(`Файлы (${validUrls.length} шт.) подготовлены к отправке!`);
    } catch (err) {
      toast.error("Не удалось загрузить файлы");
    } finally {
      toast.dismiss(loadToast);
      setUploadingFiles(false);
    }
  };

  // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 1 ТЗ): Локальное удаление ошибочно выбранного файла перед отправкой
  const handleRemoveAttachedFile = (indexToRemove) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    toast.success("Вложение удалено из очереди отправки!");
  };

  // ИСПРАВЛЕНО ДЛЯ ВКР (Красивые имена): Извлечение оригинального названия документа (без временных хэшей)
  const getCleanFileName = (fileUrl) => {
    if (!fileUrl) return "Вложение";
    const rawName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    if (rawName.includes('_')) {
      return rawName.substring(rawName.indexOf('_') + 1);
    }
    return rawName;
  };

  const formatMessageDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${hours}:${minutes} (${day}.${month})`;
  };

const handleDownloadFile = async (e, fileUrl, fileName) => {
  e.preventDefault();

  const finalUrl = getImageUrl(fileUrl);
  const downloadToast = toast.loading("Подготовка файла к скачиванию...");

  try {
    const response = await fetch(finalUrl);

    if (!response.ok) {
      throw new Error(`Ошибка скачивания файла: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

    window.URL.revokeObjectURL(url);
    toast.success("Скачивание началось!");
  } catch (error) {
    console.error(error);
    toast.error("Не удалось скачать файл.");
  } finally {
    toast.dismiss(downloadToast);
  }
};

  const renderCheckmarks = (message) => {
    if (!conversationData) return <span className="checkmarks unread" style={{ color: "#a6a6a6" }}>✓</span>;
    const isCurrentUserSellerInChat = conversationData.sellerID?._id === user?._id || conversationData.sellerID === user?._id;
    const isRoomReadByPartner = isCurrentUserSellerInChat ? conversationData.readByBuyer : conversationData.readBySeller;
    const isMessageRead = message.isRead || isRoomReadByPartner;
    return isMessageRead ? (
      <span className="checkmarks read" style={{ color: "#1dbf73", fontWeight: "bold", fontSize: "14px" }}>✓✓</span>
    ) : (
      <span className="checkmarks unread" style={{ color: "#a6a6a6", fontSize: "14px" }}>✓</span>
    );
  };

  const handleMessageSubmit = async (event) => {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const textValue = textarea?.value?.trim();
    if (!user || (!textValue && attachedFiles.length === 0)) return;
    mutation.mutate({
      conversationID,
      description: textValue || "",
      files: attachedFiles
    });
    setAttachedFiles([]);
    event.target.reset();
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
                    <div className="avatar-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span className="user-chat-name" style={{ fontSize: "11px", color: "#74767e", marginBottom: "2px", fontWeight: "500" }}>
                        {message.userID?.username || "Пользователь"}
                      </span>
                      <img
                        src={message.userID?.image || message.userID?.img || '/media/noavatar.png'}
                        alt="avatar"
                      />
                    </div>
                    <div className="message-content">
                      {message.description && <p>{message.description}</p>}
                      {message.files && message.files.length > 0 && (
                        <div className="message-attached-files" style={{ marginTop: "5px", display: "flex", flexDirection: "column", gap: "5px" }}>
                          {message.files.map((fUrl, idx) => {
                            const cleanName = getCleanFileName(fUrl); // ИСПРАВЛЕНО: Выводим реальное имя без хэшей
                            return (
                              <a 
                                key={idx} 
                                href={fUrl} 
                                onClick={(e) => handleDownloadFile(e, fUrl, cleanName)}
                                style={{ fontSize: "12px", color: "#1dbf73", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                              >
                                💾 {cleanName}
                              </a>
                            );
                          })}
                        </div>
                      )}
                      <div className="status-wrapper" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                        <span className="message-time" style={{ fontSize: "10px", color: "#9c9c9c" }}>
                          {formatMessageDate(message.createdAt)}
                        </span>
                        {isOwner && renderCheckmarks(message)}
                      </div>
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
          
          {/* ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 1 ТЗ): Очередь прикрепленных файлов с кнопками отмены */}
          {attachedFiles.length > 0 && (
            <div className="attached-queue-preview" style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "10px", backgroundColor: "#f8f9fa", border: "1px dashed #e4e5e7", borderRadius: "4px", marginBottom: "10px" }}>
              {attachedFiles.map((fUrl, index) => {
                const visibleName = getCleanFileName(fUrl);
                return (
                  <div key={index} style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#fff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #d1d3d4", fontSize: "12px" }}>
                    <span style={{ color: "#555", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📎 {visibleName}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveAttachedFile(index)} 
                      style={{ border: "none", backgroundColor: "transparent", color: "#e74c3c", cursor: "pointer", fontWeight: "bold", padding: "0 2px", fontSize: "12px", margin: 0, width: "auto", height: "auto" }}
                      title="Отменить вложение"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="btn-wrapper" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "10px" }}>
            <div className="file-attach-area">
              <input type="file" id="chatMultiFiles" multiple onChange={handleFileChange} style={{ display: "none" }} disabled={uploadingFiles} />
              <label htmlFor="chatMultiFiles" style={{ padding: "8px 12px", backgroundColor: "#f4f5f7", border: "1px solid #e4e5e7", borderRadius: "4px", cursor: "pointer", fontSize: "13px", color: "#555" }}>
                {uploadingFiles ? "Загрузка..." : "📎 Добавить файлы"}
              </label>
              {attachedFiles.length > 0 && <span style={{ fontSize: "12px", color: "#1dbf73", marginLeft: "8px" }}>Выбрано объектов: {attachedFiles.length}</span>}
            </div>
            <button type='submit' disabled={mutation.isLoading || uploadingFiles}>
              {mutation.isLoading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Message;
