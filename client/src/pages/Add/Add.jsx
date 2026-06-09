import toast from 'react-hot-toast';
import { useEffect, useReducer, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gigReducer, initialState } from '../../reducers/gigReducer';
import { categoriesData } from '../../data';
import { axiosFetch, generateImageURL } from '../../utils';
import { useRecoilValue } from 'recoil';
import { userState } from '../../atoms';
import './Add.scss';

const Add = () => {
  const user = useRecoilValue(userState);
  const [state, dispatch] = useReducer(gigReducer, initialState);
  const [coverImage, setCoverImage] = useState(null);
  const [gigImages, setGigImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, []);

  const mutation = useMutation({
    mutationFn: (gig) => axiosFetch.post('/gigs', gig).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-gigs']);
      toast.success('Услуга успешно опубликована!');
      navigate('/my-gigs');
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || 'Не удалось опубликовать услугу';
      toast.error(errMsg);
    }
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    dispatch({ type: 'CHANGE_INPUT', payload: { name, value } });
  };

  const handleFormFeature = (event) => {
    event.preventDefault();
    const inputElement = event.target.querySelector('#featureInput');
    const featureValue = inputElement?.value.trim();
    
    if (!featureValue) return;
    
    dispatch({ type: 'ADD_FEATURE', payload: featureValue });
    inputElement.value = ''; 
    
    // ИСПРАВЛЕНО ДЛЯ ВКР: Раздражающая всплывающая отбивка (toast) удалена ради удобства интерфейса
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!state.title?.trim()) return toast.error('Пожалуйста, укажите название услуги!');
    if (!state.category) return toast.error('Пожалуйста, выберите категорию услуги!');
    if (!state.description?.trim()) return toast.error('Пожалуйста, добавьте подробное описание!');
    if (!coverImage) return toast.error('Пожалуйста, выберите и загрузите обложку услуги!');
    if (!state.deliveryTime || state.deliveryTime < 1) return toast.error('Укажите корректный срок выполнения в днях!');
    if (!state.revisionNumber || state.revisionNumber < 1) return toast.error('Укажите количество допустимых правок!');
    if (!state.price || state.price < 1) return toast.error('Пожалуйста, укажите стоимость услуги!');

    let loadingToastId;
    try {
      setUploading(true);
      loadingToastId = toast.loading('Загрузка медиафайлов на server...');
      
      // 1. Отправка обложки в хранилище (теперь летит чистый файл)
      const coverRes = await generateImageURL(coverImage);
      
      // 2. Отправка примеров работ (если они выбраны)
      let imagesUrls = [];
      if (gigImages && gigImages.length > 0) {
        const uploadedImages = await Promise.all(
          [...gigImages].map(async (img) => await generateImageURL(img))
        );
        imagesUrls = uploadedImages.map((img) => img.url);
      } else {
        imagesUrls = ["/media/default-cover.png"];
      }

      // 3. Формирование финального NoSQL документа
      const form = { 
        ...state, 
        userID: user?._id,
        cover: coverRes.url, 
        images: imagesUrls, 
        category: state.category, 
        shortTitle: state.title, 
        shortDesc: state.description 
      };

      toast.dismiss(loadingToastId);
      setUploading(false);
      mutation.mutate(form);
    } catch (error) { 
      if (loadingToastId) toast.dismiss(loadingToastId);
      setUploading(false); 
      console.error("Критическая ошибка загрузки в облако:", error);
      toast.error('Произошла ошибка при загрузке изображений в облако');
    }
  };

  return (
    <div className='add'>
      <div className="container">
        <h1>Создать новую услугу</h1>
        <div className="sections">
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="left">
            <label htmlFor="title">Название услуги</label>
            <input 
              id="title" 
              name='title' 
              type="text" 
              placeholder='Например: Я разработаю современный веб-сайт на React' 
              onChange={handleFormChange} 
            />
            <label htmlFor="category">Категория (Направление)</label>
            <select 
              name="category" 
              id="category" 
              onChange={handleFormChange} 
              value={state.category || ''}
            >
              <option value=''>Выберите специализацию услуги</option>
              {categoriesData.map((macro) => (
                <optgroup key={macro.id} label={macro.title}>
                  {macro.subCategories?.map((subCat) => (
                    <option key={subCat} value={subCat}>
                      {subCat}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <label htmlFor="description">Подробное описание услуги</label>
            <textarea 
              id="description"
              name='description' 
              cols="30" 
              rows="5" 
              placeholder='Подробно опишите, какой результат или продукт получит клиент в ходе сотрудничества' 
              onChange={handleFormChange}
            ></textarea>
            <button onClick={handleFormSubmit} disabled={uploading}>
              {uploading ? 'Обработка данных...' : 'Опубликовать услугу'}
            </button>
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="right">
            <label>Обложка услуги</label>
            <div className="images">
              <div className="imagesInputs">
                <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} />
              </div>
            </div>
            <label>Загрузить примеры работ</label>
            <div className="images">
              <div className="imagesInputs">
                <input type="file" multiple onChange={(e) => setGigImages(e.target.files)} />
              </div>
            </div>
            <label htmlFor="deliveryTime">Срок выполнения в днях</label>
            <input id="deliveryTime" type="number" name='deliveryTime' min='1' onChange={handleFormChange} />
            <label htmlFor="revisionNumber">Количество допустимых правок в рамках одной оплаты</label>
            <input id="revisionNumber" type="number" name='revisionNumber' min='1' onChange={handleFormChange} />
            <label>Что входит в стоимость</label>
            <form className='add' onSubmit={handleFormFeature}>
              <input 
                id="featureInput"
                type="text" 
                placeholder='Например: Адаптивный дизайн для мобильных устройств' 
              />
              <button type='submit'>Добавить</button>
            </form>
            <div className="addedFeatures">
              {state.features?.map((feature) => (
                <div key={feature} className="item">
                  <button type="button" onClick={() => {
                    dispatch({ type: 'REMOVE_FEATURE', payload: feature });
                    toast.success('Компонент стоимости удален');
                  }}>{feature}
                    <span>X</span>
                  </button>
                </div>
              ))}
            </div>
            <label htmlFor="price">Стоимость (в рублях)</label>
            <input id="price" name='price' type="number" min='1' onChange={handleFormChange} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Add;
