import React from 'react';
import { Link } from 'react-router-dom';
import './GigCard.scss';

const GigCard = ({ item }) => {
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const authorData = item?.userID;

  const coverUrl = item?.cover 
    ? (item.cover.startsWith('http') || item.cover.startsWith('/media/') ? item.cover : `${backendUrl}/uploads/${item.cover}`)
    : "/media/noimage.png";

  const avatarUrl = authorData?.image || authorData?.img
    ? ((authorData.image || authorData.img).startsWith('http') || (authorData.image || authorData.img).startsWith('/media/'))
      ? (authorData.image || authorData.img) 
      : `${backendUrl}/uploads/${authorData.image || authorData.img}`
    : '/media/noavatar.png';

  const hasRatings = item?.authorStarNumber > 0;
  const starRating = hasRatings ? (item.authorTotalStars / item.authorStarNumber) : 0;

  return (
    <Link to={`/gig/${item?._id}`} className="link">
      <div className="gigCard" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", border: "1px solid #e4e5e7", borderRadius: "4px", overflow: "hidden", backgroundColor: "#fff" }}>
        <div>
          <img src={coverUrl} alt="Обложка услуги" style={{ width: "100%", height: "170px", objectFit: "cover" }} />
          <div className="info" style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            
            <div className="user" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src={avatarUrl} alt="" style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }} />
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#404145" }}>
                  {authorData?.username || 'Исполнитель'}
                </span>
              </div>
              
              <div className="star" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {hasRatings ? (
                  <>
                    <img src="/media/star.png" alt="★" style={{ width: "13px", height: "13px", objectFit: "contain" }} />
                    <span style={{ fontWeight: "700", color: "#ffc107", fontSize: "13px" }}>{starRating.toFixed(1)}</span>
                    <span style={{ color: "#999", fontSize: "11px" }}>({item?.authorStarNumber})</span>
                  </>
                ) : (
                  <span style={{ color: "#b5b6ba", fontSize: "11px", fontWeight: "500" }}>0.0 (0)</span>
                )}
              </div>
            </div>

            <p style={{ margin: "5px 0", fontSize: "15px", color: "#222325", height: "44px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, lineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.4" }}>
              {item?.title || item?.description || "Без названия"}
            </p>
          </div>
        </div>
        <div>
          <hr style={{ border: "none", borderTop: "1px solid #e4e5e7", margin: "0" }} />
          <div className="detail" style={{ padding: "10px 15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src="/media/star.png" alt="heart" style={{ width: "16px", height: "16px", filter: "grayscale(1)", opacity: 0.2 }} />
            <div className="price" style={{ textAlign: "right" }}>
              <span style={{ fontSize: "10px", color: "#74767e", display: "block", fontWeight: "600" }}>СТАРТОВАЯ ЦЕНА</span>
              <h2 style={{ fontSize: "18px", margin: "0", color: "#1dbf73", fontWeight: "700" }}>
                {(item?.price || 0).toLocaleString('ru-RU')} ₽
              </h2>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
