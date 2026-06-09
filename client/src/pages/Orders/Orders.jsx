import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { axiosFetch } from "../../utils";
import { useRecoilValue } from "recoil";
import { userState } from "../../atoms";
import { Loader } from '../../components';
import "./Orders.scss";

const Orders = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Запрос массива активных контрактов пользователя из СУБД
  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      axiosFetch
        .get(`/orders`)
        .then(({ data }) => {
          return data;
        })
        .catch((err) => {
          console.log(err.response?.data || err.message);
          return [];
        }),
  });

  // ИСПРАВЛЕНО ДЛЯ ВКР (Пункт 1): Безопасная логика поиска или создания диалога без пустых окон
  const handleContact = async (order) => {
    // Извлекаем ID контрагентов с защитой от разной структуры объектов в базе
    const sellerID = order.sellerID?._id || order.sellerID;
    const buyerID = order.buyerID?._id || order.buyerID;

    // Генерируем стандартный системный идентификатор диалога
    const conversationID = user.isSeller ? `${request.userID}-${buyerID}` : `${sellerID}-${request.userID}`;

    try {
      // Сначала пробуем получить данные этого диалога с сервера
      const { data: convData } = await axiosFetch.get(`/conversations/single/${sellerID}/${buyerID}`);
      // Если диалог найден, плавно переходим внутрь переписки со всей историей
      navigate(`/message/${convData.conversationID || convData.id}`);
    } 
    catch (err) {
      // Если сервер вернул 404 (Чат еще не создан), принудительно генерируем новый контракт связи
      if (err.response?.status === 404 || err.status === 404) {
        try {
          const { data: newConv } = await axiosFetch.post("/conversations", {
            to: user.isSeller ? buyerID : sellerID,
            from: user.isSeller ? sellerID : buyerID,
          });
          navigate(`/message/${newConv.conversationID || newConv.id}`);
        } catch (postErr) {
          console.error("Критическая ошибка создания NoSQL диалога:", postErr);
        }
      } else {
        console.error("Ошибка эквайринга чатов:", err);
      }
    }
  };

  if (!user) return <div className="loader"><Loader /></div>;

  return (
    <div className="orders">
      {isLoading ? (
        <div className="loader"> <Loader /> </div>
      ) : error ? (
        <div className="error-msg" style={{ textAlign: "center", padding: "40px", color: "red" }}>
          Что-то пошло не так при загрузке заказов!
        </div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Заказы</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>Изображение</th>
                <th>{user.isSeller ? "Заказчик" : "Исполнитель"}</th>
                <th>Название услуги</th>
                <th>Стоимость</th>
                <th>Связаться</th>
              </tr>
            </thead>
            <tbody>
              {data && data.map((order) => {
                const partner = user.isSeller ? order.buyerID : order.sellerID;
                const orderImage = order.image || "/media/default-cover.png";

                return (
                  <tr key={order._id}>
                    <td>
                      <img className="img" src={orderImage.startsWith('http') ? orderImage : `http://localhost:8080/uploads/${orderImage}`} alt="service cover" />
                    </td>
                    <td>
                      {partner?.username || "Пользователь"}
                    </td>
                    <td>
                      {order.title && order.title.length > 30 
                        ? `${order.title.slice(0, 30)}...` 
                        : order.title || "Название услуги"}
                    </td>
                    <td>
                      {order.price?.toLocaleString("ru-RU", {
                        maximumFractionDigits: 0,
                        style: "currency",
                        currency: "RUB",
                      })}
                    </td>
                    <td>
                      <img
                        className="message"
                        src="./media/message.png"
                        alt="message icon"
                        onClick={() => handleContact(order)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
