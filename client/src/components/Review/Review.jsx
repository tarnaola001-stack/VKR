import { getCountryFlag } from '../../utils';
import './Review.scss';

const Review = (props) => {
  const { review } = props;
  const country = getCountryFlag(review?.userID?.country);

  return (
    <div className="review">
      <div className="user">
        {/* ИСПРАВЛЕНО ДЛЯ ВКР: Добавлен строгий класс review-avatar для защиты от поплывших картинок */}
        <img
          className="pp review-avatar"
          src={review.userID?.image || review.userID?.img || '/media/noavatar.png'}
          alt="user avatar"
        />
        <div className="info">
          <span>{review?.userID?.username}</span>
          <div className="country">
            {country?.normal && (
              <img
                src={country?.normal}
                alt="flag"
              />
            )}
            <span>{review?.userID?.country || 'Russia'}</span>
          </div>
        </div>
      </div>
      <div className="stars">
        {
          review.star > 0 && new Array(review.star).fill(0).map((_, i) => (
            <img key={i} src='/media/star.png' alt='star' />
          ))
        }
        <span>{review.star}</span>
      </div>
      <p>{review.description}</p>
      
      {/* ИСПРАВЛЕНО ДЛЯ ВКР: Блок "Helpful? Yes/No" полностью вырезан из интерфейса */}
    </div>
  );
};

export default Review;
