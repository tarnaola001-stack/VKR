import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import { axiosFetch } from "../../utils";
import { useLocation } from "react-router-dom";

function Gigs() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const rawCat = queryParams.get("cat") || "all";
  const urlSubCat = queryParams.get("subCat") || "all";
  const searchQuery = queryParams.get("search") || ""; 

  const [selectedSub, setSelectedSub] = useState(urlSubCat);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setSelectedSub(urlSubCat);
  }, [urlSubCat, search]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const getNormalizedCat = (catParam) => {
    const lower = catParam.toLowerCase().trim();
    if (lower === "programming" || lower.includes("разработка") || lower === "it") return "programming";
    if (lower === "design" || lower.includes("графика")) return "design";
    if (lower === "video" || lower.includes("видео")) return "video";
    if (lower === "writing" || lower.includes("тексты") || lower === "texts") return "writing";
    if (lower === "marketing" || lower.includes("маркетинг")) return "marketing";
    if (lower === "music" || lower.includes("аудио") || lower === "audio") return "music";
    if (lower === "ai" || lower.includes("нейросети")) return "ai";
    if (lower === "business" || lower.includes("бизнес")) return "business";
    return "all";
  };

  const currentCat = getNormalizedCat(rawCat);

  const subcategoriesData = {
    programming: [
      "Веб-разработка (React, Vue, Node.js)",
      "Full-stack разработка приложений",
      "Проектирование и администрирование баз данных",
      "Разработка мобильных приложений (iOS, Android)",
      "Разработка и внедрение решений 1С"
    ],
    design: [
      "Дизайн логотипов и фирменный стиль",
      "UI/UX дизайн сайтов и приложений",
      "Иллюстрации и коммерческая графика",
      "Дизайн полиграфии, упаковки и обложек",
      "3D-моделирование и визуализация интерьеров"
    ],
    video: [
      "Видеомонтаж коммерческих роликов",
      "Создание 2D/3D анимации и моушн-дизайн",
      "Монтаж коротких видео (Reels, Shorts, VK)",
      "Создание интро, заставок и эффектов",
      "Съемка и продакшн видео под ключ"
    ],
    writing: [
      "Копирайтинг, статьи и SEO-тексты",
      "Профессиональный перевод и локализация",
      "Редактура, корректура и вычитка материалов",
      "Написание сценариев для видео и подкастов",
      "Техническая документация и бизнес-райтинг"
    ],
    marketing: [
      "Комплексное продвижение в соцсетях (SMM)",
      "Настройка таргетированной и контекстной рекламы",
      "Поисковая оптимизация сайтов (SEO)",
      "Email-маркетинг и автоворонки продаж",
      "Аналитика рынка и marketing-стратегии"
    ],
    music: [
      "Дикторская озвучка видео, рекламы и книг",
      "Сведение, мастеринг и обработка аудио",
      "Создание музыки, битов и саунд-дизайн",
      "Написание песен и текстов к трекам",
      "Монтаж подкастов и чистка звука от шумов"
    ],
    ai: [
      "Разработка и обучение нейросетевых моделей",
      "Интеграция API искусственного интеллекта (ChatGPT, Midjourney)",
      "Создание и автоматизация Telegram-ботов с ИИ",
      "Генерация ИИ-контента (изображения, тексты, ИИ-аватары)",
      "Консалтинг и внедрение ИИ в бизнес-процессы"
    ],
    business: [
      "Разработка бизнес-планов и финансовых моделей",
      "Ведение бухгалтерского и управленческого учета",
      "Юридическая помощь, составление договоров",
      "Парсинг данных, сбор и обработка баз (Data Entry)",
      "Услуги виртуального ассистента и тайм-менеджмент"
    ]
  };

  const currentSubList = currentCat !== "all"
    ? (subcategoriesData[currentCat] || [])
    : Object.values(subcategoriesData).flat();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs", currentCat, selectedSub, sort, localSearch],
    queryFn: () => {
      const min = minRef.current?.value || "";
      const max = maxRef.current?.value || "";
      let url = `/gigs?sort=${sort}&min=${min}&max=${max}`;
      if (currentCat !== "all") url += `&category=${currentCat}`;
      if (selectedSub !== "all") url += `&subCategory=${encodeURIComponent(selectedSub)}`;
      if (localSearch) url += `&search=${encodeURIComponent(localSearch)}`;
      return axiosFetch.get(url).then((res) => res.data);
    },
  });

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  useEffect(() => {
    refetch();
  }, [sort, selectedSub, search, localSearch]);

  const catNames = {
    programming: "Разработка и IT",
    design: "Графика и дизайн",
    video: "Видео и анимация",
    writing: "Тексты и переводы",
    marketing: "Маркетинг и SMM",
    music: "Аудио и музыка",
    ai: "Нейросети и ИИ",
    business: "Бизнес и аналитика"
  };

  return (
    <div className="gigs">
      <div className="container">
        <span className="breadcrumbs">FreelancePF &gt; Каталог &gt;</span>
        <div className="catalog-header-search" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h1>{catNames[currentCat] || "Все услуги"}</h1>
          <div className="inner-search-box" style={{ display: "flex", gap: "5px" }}>
            <input 
              type="text" 
              value={localSearch} 
              placeholder="Поиск по ключевым словам..." 
              onChange={(e) => setLocalSearch(e.target.value)} 
              style={{ padding: "6px 12px", border: "1px solid #e4e5e7", borderRadius: "4px", fontSize: "14px", width: "250px" }}
            />
            <button onClick={() => refetch()} style={{ padding: "6px 15px", backgroundColor: "#1dbf73", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>Найти</button>
          </div>
        </div>
        <p>Эффективные решения для ваших задач от проверенных специалистов</p>
        <div className="menu">
          <div className="left">
            <span>Бюджет</span>
            <input ref={minRef} type="number" placeholder="от" />
            <input ref={maxRef} type="number" placeholder="до" />
            <select
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
              className="subcategory-select-input"
            >
              <option value="all">— Все подкатегории —</option>
              {currentSubList.map((sub, i) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
            </select>
            <button onClick={() => refetch()}>Применить</button>
          </div>
          <div className="right">
            <span className="sortBy">Сортировка</span>
            <span className="sortType">{sort === "sales" ? "Популярные" : "Новые"}</span>
            <img src="./img/down.png" alt="" onClick={() => setOpen(!open)} />
            {open && (
              <div className="rightMenu">
                {sort === "sales" ? (
                  <span onClick={() => reSort("createdAt")}>Новые</span>
                ) : (
                  <span onClick={() => reSort("sales")}>Популярные</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="cards">
          {isLoading ? (
            "Загрузка каталога..."
          ) : error ? (
            "Что-то пошло не так при загрузке!"
          ) : data?.length === 0 ? (
            <div className="no-gigs">В этой категории пока нет объявлений.</div>
          ) : (
            data?.map((gigItem) => (
              <GigCard key={gigItem._id} item={gigItem} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Gigs;
