export const categoriesData = [
  {
    id: "programming",
    title: "Разработка и IT",
    subCategories: [
      "Веб-разработка (React, Vue, Node.js)",
      "Full-stack разработка приложений",
      "Проектирование и администрирование баз данных",
      "Разработка мобильных приложений (iOS, Android)",
      "Разработка и внедрение решений 1С"
    ]
  },
  {
    id: "design",
    title: "Графика и дизайн",
    subCategories: [
      "Дизайн логотипов и фирменный стиль",
      "UI/UX дизайн сайтов и приложений",
      "Иллюстрации и коммерческая графика",
      "Дизайн полиграфии, упаковки и обложек",
      "3D-моделирование и визуализация интерьеров"
    ]
  },
  {
    id: "video",
    title: "Видео и анимация",
    subCategories: [
      "Видеомонтаж коммерческих роликов",
      "Создание 2D/3D анимации и моушн-дизайн",
      "Монтаж коротких видео (Reels, Shorts, VK)",
      "Создание интро, заставок и эффектов",
      "Съемка и продакшн видео под ключ"
    ]
  },
  {
    id: "writing",
    title: "Тексты и переводы",
    subCategories: [
      "Копирайтинг, статьи и SEO-тексты",
      "Профессиональный перевод и локализация",
      "Редактура, корректура и вычитка материалов",
      "Написание сценариев для видео и подкастов",
      "Техническая документация и бизнес-райтинг"
    ]
  },
  {
    id: "marketing",
    title: "Маркетинг и SMM",
    subCategories: [
      "Комплексное продвижение в соцсетях (SMM)",
      "Настройка таргетированной и контекстной рекламы",
      "Поисковая оптимизация сайтов (SEO)",
      "Email-маркетинг и автоворонки продаж",
      "Аналитика рынка и marketing-стратегии"
    ]
  },
  {
    id: "music",
    title: "Аудио и музыка",
    subCategories: [
      "Дикторская озвучка видео, рекламы и книг",
      "Сведение, мастеринг и обработка аудио",
      "Создание музыки, битов и саунд-дизайн",
      "Написание песен и текстов к трекам",
      "Монтаж подкастов и чистка звука от шумов"
    ]
  },
  {
    id: "ai",
    title: "Нейросети и ИИ",
    subCategories: [
      "Разработка и обучение нейросетевых моделей",
      "Интеграция API искусственного интеллекта (ChatGPT, Midjourney)",
      "Создание и автоматизация Telegram-ботов с ИИ",
      "Генерация ИИ-контента (изображения, тексты, ИИ-аватары)",
      "Консалтинг и внедрение ИИ в бизнес-процессы"
    ]
  },
  {
    id: "business",
    title: "Бизнес и аналитика",
    subCategories: [
      "Разработка бизнес-планов и финансовых моделей",
      "Ведение бухгалтерского и управленческого учета",
      "Юридическая помощь, составление договоров",
      "Парсинг данных, сбор и обработка баз (Data Entry)",
      "Услуги виртуального ассистента и тайм-менеджмент"
    ]
  }
];

export const cards = [
  { id: 1, title: "Нейросети и ИИ", desc: "Внедрение искусственного интеллекта", img: "/media/1.png", slug: 'ai' },
  { id: 2, title: "Дизайн логотипов", desc: "Фирменный стиль бренда", img: "/media/2.png", slug: 'design' },
  { id: 3, title: "Разработка и IT", desc: "Инжиниринг и автоматизация", img: "/media/3.png", slug: 'programming' },
  { id: 4, title: "Дикторская озвучка", desc: "Голос для ваших проектов", img: "/media/4.png", slug: 'music' },
  { id: 5, title: "Монтаж видео", desc: "Анимация и эффекты под ключ", img: "/media/5.png", slug: 'video' },
  { id: 6, title: "Маркетинг и SMM", desc: "Продвижение бизнеса в сети", img: "/media/6.png", slug: 'marketing' },
  { id: 7, title: "Тексты и переводы", desc: "Копирайтинг и локализация", img: "/media/7.png", slug: 'writing' },
  { id: 8, title: "Бизнес-аналитика", desc: "Финансовые модели и учет", img: "/media/8.png", slug: 'business' }
];
  
  export const projects = [
    {
      id: 1,
      img: "https://images.pexels.com/photos/1462935/pexels-photo-1462935.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cat: "Веб и мобильный дизайн",
      username: "Анна Белова",
    },
    {
      id: 2,
      img: "https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cat: "Разработка логотипов",
      username: "Артем Григорьев",
    },
    {
      id: 3,
      img: "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cat: "Анимированные GIF",
      username: "Егор Потёмкин",
    },
    {
      id: 4,
      img: "https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cat: "Дизайн упаковки",
      username: "Федор Жданов",
    },
    {
      id: 5,
      img: "https://images.pexels.com/photos/4458554/pexels-photo-4458554.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cat: "Дизайн для соцсетей",
      username: "Алина Рыбакова",
    },
    {
      id: 6,
      img: "https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cat: "Иллюстрации и арт",
      username: "Даниил Харитонов",
    },
    {
      id: 7,
      img: "https://images.pexels.com/photos/6077368/pexels-photo-6077368.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cat: "Дизайн книг",
      username: "Елена Дорофеева",
    },
    {
      id: 8,
      img: "https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/1680175/pexels-photo-1680175.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cat: "Цифровой маркетинг",
      username: "Вадим Бреев",
    },
  ];
  
  // Массив заглушек для услуг (если используется на демо-страницах)
  export const gigs = [
    {
      id: 1,
      img: "https://images.pexels.com/photos/580151/pexels-photo-580151.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/720598/pexels-photo-720598.jpeg?auto=compress&cs=tinysrgb&w=1600",
      desc: "Создам уникального персонажа при помощи нейросети Midjourney по вашему текстовому описанию",
      price: 1500,
      star: 5,
      username: "Анна Белова",
    },
    {
      id: 2,
      img: "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=1600",
      desc: "Разработка профессионального дизайна интерфейсов ультра-высокого качества",
      price: 3400,
      star: 5,
      username: "Лариса Колесникова",
    },
    {
      id: 3,
      img: "https://images.pexels.com/photos/8797307/pexels-photo-8797307.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/1062280/pexels-photo-1062280.jpeg?auto=compress&cs=tinysrgb&w=1600",
      desc: "Услуги художника искусственного интеллекта: генерация сложных концепт-артов",
      price: 2200,
      star: 5,
      username: "Светлана Степанова",
    },
    {
      id: 4,
      img: "https://images.pexels.com/photos/5708069/pexels-photo-5708069.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1600",
      desc: "Создание кастомных цифровых портретов и артов по вашим личным фотографиям",
      price: 1800,
      star: 4,
      username: "Дмитрий Волков",
    },
    {
      id: 5,
      img: "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/1771383/pexels-photo-1771383.jpeg?auto=compress&cs=tinysrgb&w=1600",
      desc: "Визуализация идей и концепций в высококачественных коммерческих иллюстрациях",
      price: 4500,
      star: 5,
      username: "Алина Рыбакова",
    },
    {
      id: 6,
      img: "https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pp: "https://images.pexels.com/photos/715546/pexels-photo-715546.jpeg?auto=compress&cs=tinysrgb&w=1600",
      desc: "Гиперреалистичная цифровая живопись и отрисовка сложных ИИ-иллюстраций под ключ",
      price: 2900,
      star: 4,
      username: "Валерий Шестаков",
    }
];
