import React from 'react';
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
        {/* Клик по самой картинке ведет в макрокатегорию */}
        <Link to={`/gigs?cat=${data.slug}`} className='cardLinkWrapper'>
          <img src={data.img} alt={data.title} />
          <span className='desc'>{data.desc}</span>
          <span className='title'>{data.title}</span>
        </Link>
        
        {/* Интерактивный оверлей с подкатегориями */}
        {subCategoriesList.length > 0 && (
          <div className="subCategoriesHoverMenu">
            <ul>
              {subCategoriesList.map((sub, index) => (
                <li key={index}>
                  {/* ИСПРАВЛЕНО ДЛЯ ВКР: Ссылки перенаправляют на страницу с правильными Query-параметрами */}
                  <Link 
                    to={`/gigs?cat=${data.slug}&subCat=${encodeURIComponent(sub)}`} 
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
