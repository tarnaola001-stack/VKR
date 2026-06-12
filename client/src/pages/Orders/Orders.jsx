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

  const handleContact = async (order) => {
    const sellerID = order.sellerID?._id || order.sellerID;
    const buyerID = order.buyerID?._id || order.buyerID;
    
    // Безопасно вытаскиваем ID услуги для изоляции комнаты чата
    const targetGigID = order.gigID?._id || order.gigID;

    try {
      // ИСПРАВЛЕНО: Передаем gigID и точный title на сервер для разведения диалогов
      const { data: newConv } = await axiosFetch.post("/conversations", {
        to: user._id === sellerID ? buyerID : sellerID,
        title: order.title || "Обсуждение заказа",
        gigID: targetGigID
      });
      
      localStorage.setItem(`theme_${newConv.conversationID}`, order.title || "Обсуждение заказа");
      navigate(`/message/${newConv.conversationID}`);
    } 
    catch (err) {
      console.error("Критическая ошибка инициализации NoSQL диалога:", err);
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
                <th>Собеседник по сделке</th>
                <th>Название услуги</th>
                <th>Стоимость</th>
                <th>Связаться</th>
              </tr>
            </thead>
            <tbody>
              {data && data.map((order) => {
                const isUserSellerInOrder = order.sellerID?._id === user._id || order.sellerID === user._id;
                const partner = isUserSellerInOrder ? order.buyerID : order.sellerID;
                const orderImage = order.image || "/media/default-cover.png";
                
                return (
                  <tr key={order._id}>
                    <td>
                      <img className="img" src={orderImage.startsWith('http') || orderImage.startsWith('/media/') ? orderImage : `http://localhost:8080/uploads/${orderImage}`} alt="service cover" />
                    </td>
                    <td>
                      {partner?.username || "Пользователь"}
                    </td>
                    <td>
                      {order.title && order.title.length > 45 
                        ? `${order.title.slice(0, 45)}...` 
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
