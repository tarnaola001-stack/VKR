import { Link } from 'react-router-dom';
import { categoriesData } from '../../data';
import './CategoryCard.scss';

const Card = (props) => {
  const data = props.data || props.card || props.item || props;

  if (!data || !data.slug) return null;

  const currentCategoryObj = categoriesData.find(cat => cat.id === data.slug);
  const subCategoriesList = currentCategoryObj ? currentCategoryObj.subCategories : [];

  return (
    <div className='cardWrapper'>
      <div className='cardContainer'>
        {/* Клик по самой картинке или главному заголовку ведет в общую макро-категорию */}
        <Link to={`/gigs?category=${data.slug}`} className='cardLinkWrapper'>
          <img src={data.img} alt="" />
          <span className='desc'>{data.desc}</span>
          <span className='title'>{data.title}</span>
        </Link>

        {/* Интерактивный оверлей с подкатегориями */}
        {subCategoriesList.length > 0 && (
          <div className="subCategoriesHoverMenu">
            <ul>
              {subCategoriesList.map((sub, index) => (
                <li key={index}>
                  {/* ИСПРАВЛЕНО ДЛЯ ВКР: Теперь подкатегории — это живые ссылки с параметрами фильтрации */}
                  <Link 
                    to={`/gigs?category=${data.slug}&subCategory=${encodeURIComponent(sub)}`} 
                    className="subCatLink"
                  >
                    {sub}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;