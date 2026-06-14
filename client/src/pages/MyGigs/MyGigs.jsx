import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosFetch, getImageUrl } from '../../utils';
import { useRecoilValue } from 'recoil';
import { userState } from '../../atoms';
import { Loader } from '../../components';
import './MyGigs.scss';

const MyGigs = () => {
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ['my-gigs'],
    queryFn: () =>
      axiosFetch(`/gigs?userID=${user._id}`)
        .then(({ data }) => {
          return data;
        })
        .catch(({ response }) => {
          console.log(response.data);
        })
  });

  const mutation = useMutation({
    mutationFn: (_id) => axiosFetch.delete(`/gigs/${_id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-gigs']);
    }
  });

  const handleGigDelete = (gig) => {
    if (window.confirm(`Вы действительно хотите удалить услугу "${gig.title}"?`)) {
      mutation.mutate(gig._id);
      toast.success(`Услуга "${gig.title}" успешно удалена!`);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='myGigs'>
      {isLoading ? (
        <div className='loader'> <Loader size={35} /> </div>
      ) : error ? (
        <div className="error-state">Что-то пошло не так при загрузке данных</div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Мои услуги</h1>
            <Link to='/add' className='link'>
              <button>Создать услугу</button>
            </Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>Стоимость</th>
                <th>Продажи</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {data && data.map((gig) => {
                // ИСПРАВЛЕНО ДЛЯ ХОСТИНГА: Динамическая сборка ссылки без жесткого localhost
            const imgUrl = getImageUrl(gig.cover);

                return (
                  <tr key={gig._id}>
                    {/* Переход на страницу услуги теперь происходит только при клике на название */}
                    <td>
                      <img
                        className="cover"
                        src={imgUrl}
                        alt="обложка"
                      />
                    </td>
                    <td 
                      onClick={() => navigate(`/gig/${gig._id}`)} 
                      style={{ cursor: "pointer", color: "#1dbf73", fontWeight: "500" }}
                    >
                      {gig.title}
                    </td>
                    <td>
                      {gig.price ? gig.price.toLocaleString("ru-RU", {
                        maximumFractionDigits: 0,
                        style: "currency",
                        currency: "RUB",
                      }) : "0 ₽"}
                    </td>
                    <td>{gig.sales || 0}</td>
                    <td>
                      <img 
                        className='delete' 
                        src="./media/delete.png" 
                        alt="delete" 
                        onClick={() => handleGigDelete(gig)} 
                        style={{ cursor: "pointer" }}
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

export default MyGigs;