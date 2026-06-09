import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosFetch } from '../../utils';
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
          console.table(data)
          return data;
        })
        .catch(({ response }) => {
          console.log(response.data);
        })
  });

  const mutation = useMutation({
    mutationFn: (_id) =>
      axiosFetch.delete(`/gigs/${_id}`)
    ,
    onSuccess: () =>
      queryClient.invalidateQueries(['my-gigs'])
  });

  // ИСПРАВЛЕНО: Русифицированное уведомление об удалении услуги
  const handleGigDelete = (gig) => {
    mutation.mutate(gig._id);
    toast.success(`Услуга "${gig.title}" успешно удалена!`);
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className='myGigs'>
      {
        isLoading
          ? <div className='loader'> <Loader size={35} /> </div>
          : error
            ? 'Что-то пошло не так при загрузке данных'
            : <div className="container">
              {/* ИСПРАВЛЕНО: Полная русификация панели управления продавца */}
              <div className="title">
                <h1>Мои услуги</h1>
                <Link to='/organize' className='link'>
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
                  {
                    data.map((gig) => (
                      <tr key={gig._id} onClick={() => navigate(`/gig/${gig._id}`)}>
                        <td>
                          <img
                            className="cover"
                            src={gig.cover}
                            alt=""
                          />
                        </td>
                        <td>{gig.title}</td>
                        {/* ИСПРАВЛЕНО ДЛЯ ВКР: Форматирование вывода цены в рублях вместо индийских рупий */}
                        <td>{gig.price.toLocaleString("ru-RU", {
                          maximumFractionDigits: 0,
                          style: "currency",
                          currency: "RUB",
                        })}</td>
                        <td>{gig.sales}</td>
                        <td>
                          <img className='delete' src="./media/delete.png" alt="delete" onClick={() => handleGigDelete(gig)} />
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
      }
    </div>
  )
}

export default MyGigs;
