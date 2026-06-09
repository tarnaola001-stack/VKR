import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Featured.scss';

const Featured = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="featured">
      <div className="container">
        <div className="left">
          <h1>Найдите идеальные <i>фриланс</i>-услуги для вашего бизнеса</h1>
          
          {/* Восстановленная строка поиска с правильной структурой */}
          <div className="search">
            <div className="searchInput">
              <input 
                type="text" 
                placeholder='Попробуйте: "разработка сайта"' 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button onClick={handleSearch}>Найти</button>
          </div>
          {/* БЛОК ПОПУЛЯРНОЕ УСПЕШНО УДАЛЕН */}
        </div>
      </div>
    </div>
  );
};

export default Featured;
