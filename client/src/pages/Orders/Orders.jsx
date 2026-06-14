import toast from 'react-hot-toast';
import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { axiosFetch, getImageUrl } from "../../utils";
import { useRecoilValue } from "recoil";
import { userState } from "../../atoms";
import { Loader } from '../../components';
import "./Orders.scss";

const Orders = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const queryClient = useQueryClient();

  // ИСПРАВЛЕНО ДЛЯ ВКР (Финальный замок): Ручной изолированный вызов сброса баджей при входе на экран.
  // Массив зависимостей пустой [], что гарантирует СТРОГО ОДИН вызов при открытии страницы,
  // фоновые обновления таблицы больше не смогут затереть данные СУБД!
  useEffect(() => {
    window.scrollTo(0, 0);
    
    axiosFetch.put("/orders/mark-as-read")
      .then(() => {
        queryClient.invalidateQueries(["navbarOrdersBadge"]);
      })
      .catch((err) => {
        console.error("Ошибка сброса баджа:", err);
      });
  }, []); 

  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      axiosFetch
        .get(`/orders`)
        .then(({ data }) => data)
        .catch((err) => {
          console.log(err.response?.data || err.message);
          return [];
        }),
  });

  // МУТАЦИИ ДЛЯ ЭТАПОВ И ДЕДЛАЙНОВ
  const submitMilestoneMutation = useMutation({
    mutationFn: (body) => axiosFetch.post("/orders/milestone/submit", body),
    onSuccess: () => {
      // ИСПРАВЛЕНО ДЛЯ ВКР (Мгновенный UX): Принудительно перерисовываем интерфейс исполнителя сразу после сдачи,
      // чтобы кнопка исчезла мгновенно в ту же миллисекунду, исключая ошибки повторного нажатия!
      queryClient.invalidateQueries(["orders"]);
      toast.success("Этап успешно сдан! Ожидайте проверки заказчиком.");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Ошибка сдачи этапа")
  });

const reviewMilestoneMutation = useMutation({
    mutationFn: (body) => axiosFetch.post("/orders/milestone/review", body),
    onSuccess: (_, variables) => {
      // ИСПРАВЛЕНО ДЛЯ ВКР (Мгновенный сброс баджей при действиях):
      // Инвалидируем кэш таблицы заказов И баджа навигационной панели одновременно!
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["navbarOrdersBadge"]); 
      
      if (variables.action === 'approve') {
        toast.success("Этап успешно утвержден! Средства переведены исполнителю.");
      } else {
        toast.success("Задание отправлено исполнителю с пометкой 'Возвращен в работу'.");
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || "Ошибка обработки этапа")
  });

  const extendTimeMutation = useMutation({
    mutationFn: (body) => axiosFetch.post("/orders/milestone/extend", body),
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      toast.success("Срок выполнения контракта успешно продлен на 2 дня!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Ошибка продления срока")
  });

  const handleContact = async (order) => {
    const sellerID = order.sellerID?._id || order.sellerID;
    const buyerID = order.buyerID?._id || order.buyerID;
    const targetGigID = order.gigID?._id || order.gigID;
    try {
      const { data: newConv } = await axiosFetch.post("/conversations", {
        to: user._id === sellerID ? buyerID : sellerID,
        title: order.title || "Обсуждение заказа",
        gigID: targetGigID
      });
      localStorage.setItem(`theme_${newConv.conversationID}`, order.title || "Обсуждение заказа");
      navigate(`/message/${newConv.conversationID}`);
    } catch (err) {
      console.error("Критическая ошибка инициализации NoSQL диалога:", err);
    }
  };

  // ХЕЛПЕР: Вычисление даты дедлайна и статуса просрочки (On-the-Fly калькуляция для ВКР)
  const calculateDeadline = (createdAt, deliveryTime, extendedDays = 0) => {
    const start = new Date(createdAt);
    const totalDays = (deliveryTime || 1) + (extendedDays || 0);
    const deadline = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);
    
    const day = String(deadline.getDate()).padStart(2, '0');
    const month = String(deadline.getMonth() + 1).padStart(2, '0');
    const year = deadline.getFullYear();
    
    const isOverdue = new Date() > deadline;
    return {
      dateString: `${day}.${month}.${year}`,
      isOverdue
    };
  };

  const getStatusLabel = (status) => {
    if (status === 'In_Progress') return <span style={{ color: "#f39c12", fontWeight: "600" }}>В работе</span>;
    if (status === 'Under_Review') return <span style={{ color: "#2980b9", fontWeight: "600" }}>На проверке</span>;
    if (status === 'Completed') return <span style={{ color: "#1dbf73", fontWeight: "600" }}>Выполнен ✓</span>;
    if (status === 'Rejected_In_Progress') return <span style={{ color: "#e74c3c", fontWeight: "600" }}>Возвращен в работу</span>;
    return null;
  };

  if (!user) return <div className="loader"><Loader /></div>;
  return (
    <div className="orders">
      {isLoading ? (
        <div className="loader"> <Loader /> </div>
      ) : error ? (
        <div className="error-msg" style={{ textAlign: "center", padding: "40px", color: "red" }}>
          What-то пошло не так при загрузке заказов!
        </div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Заказы (Поэтапное депонирование 40/60)</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Собеседник</th>
                <th>Общая стоимость</th>
                <th>Сроки контракта</th>
                <th>Этапы выполнения сделки</th>
                <th>Чат</th>
              </tr>
            </thead>
            <tbody>
              {data && data.map((order) => {
                const isUserSellerInOrder = order.sellerID?._id === user._id || order.sellerID === user._id;
                const partner = isUserSellerInOrder ? order.buyerID : order.sellerID;
                const orderImage = getImageUrl(
                order.image || order.gigID?.cover || order.gigID?.images?.[0],
                "/media/default-cover.png"
                );
                
                const { dateString, isOverdue } = calculateDeadline(order.createdAt, order.deliveryTime, order.extendedDays);
                return (
                  <tr key={order._id} style={{ borderBottom: "2px solid #e4e5e7" }}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center" }}>
                        <img className="img" src={orderImage.startsWith('http') || 
                          orderImage.startsWith('/media/') ? orderImage : 
                          `http://localhost:8080/uploads/${orderImage}`} alt="service cover" />
                        <span style={{ fontSize: "12px", fontWeight: "600", textAlign: "center" }}>
                          {order.title && order.title.length > 30 ? `${order.title.slice(0, 30)}...` : order.title}
                        </span>
                      </div>
                    </td>
                    <td>{partner?.username || "Пользователь"}</td>
                    <td>
                      <b style={{ color: "#1dbf73" }}>
                        {order.price?.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 })}
                      </b>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                        <div>Выполнить до: <b>{dateString}</b></div>
                        {isOverdue && !order.milestones?.every(m => m.status === 'Completed') ? (
                          <div style={{ color: "#e74c3c", fontWeight: "bold" }}>⚠️ Срок контракта истек!</div>
                        ) : (
                          <div style={{ color: "#1dbf73" }}>⏱️ В рамках дедлайна</div>
                        )}
                        {!isUserSellerInOrder && isOverdue && !order.milestones?.every(m => m.status === 'Completed') && (
                          <button 
                            onClick={() => extendTimeMutation.mutate({ orderId: order._id })}
                            style={{ padding: "4px 8px", backgroundColor: "#34495e", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px", marginTop: "5px" }}
                          >
                            Дать еще +2 дня
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {/* Смарт-трекер этапов безопасной сделки 40/60 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "280px", padding: "5px 0" }}>
                        {order.milestones && order.milestones.map((milestone) => (
                          <div key={milestone._id} style={{ backgroundColor: "#f8f9fa", padding: "8px", borderRadius: "4px", border: "1px solid #e4e5e7", fontSize: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontWeight: "600" }}>{milestone.weight}% — {milestone.sum} ₽</span>
                              {getStatusLabel(milestone.status)}
                            </div>
                            <div style={{ color: "#74767e", marginBottom: "6px", fontSize: "11px" }}>{milestone.title}</div>
                            
                            {/* Интерактивные кнопки управления */}
                            <div style={{ display: "flex", gap: "5px" }}>
                              {/* Кнопка Исполнителя: Сдать этап (доступна при первичном запуске и при возврате в работу) */}
                              {isUserSellerInOrder && (milestone.status === 'In_Progress' || milestone.status === 'Rejected_In_Progress') && (
                                <button 
                                  onClick={() => submitMilestoneMutation.mutate({ orderId: order._id, milestoneId: milestone._id })}
                                  style={{ padding: "3px 6px", backgroundColor: "#1dbf73", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}
                                >
                                  🚀 Сдать этап на проверку
                                </button>
                              )}
                              {/* Кнопки Заказчика: Принять или Вернуть на доработку */}
                              {!isUserSellerInOrder && milestone.status === 'Under_Review' && (
                                <>
                                  <button 
                                    onClick={() => reviewMilestoneMutation.mutate({ orderId: order._id, milestoneId: milestone._id, action: 'approve' })}
                                    style={{ padding: "3px 6px", backgroundColor: "#1dbf73", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}
                                  >
                                    ✓ Утвердить этап
                                  </button>
                                  <button 
                                    onClick={() => reviewMilestoneMutation.mutate({ orderId: order._id, milestoneId: milestone._id, action: 'reject' })}
                                    style={{ padding: "3px 6px", backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}
                                  >
                                    ✕ На доработку
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <img
                        className="message"
                        src="./media/message.png"
                        alt="message icon"
                        onClick={() => handleContact(order)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data && data.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#74767e", fontStyle: "italic" }}>
              У вас пока нет оформленных заказов на платформе.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
