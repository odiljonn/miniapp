/** Hardoil Mini App — barcha matnlar va sozlamalar */
const HARDOIL_CONFIG = {
  brand: {
    name: "Hardoil",
    emoji: "🛢️",
    tagline: "Moy almashtirish va sifatli moylar",
  },

  tabs: {
    home: "Asosiy",
    catalog: "Katalog",
    other: "Boshqa",
  },

  home: {
    welcome: "Hardoil platformasiga xush kelibsiz!",
    servicesTitle: "Xizmatlarimiz",
    services: [
      {
        icon: "🔧",
        title: "Moy almashtirish",
        desc: "Professional xizmat, tez va ishonchli",
      },
      {
        icon: "🛢️",
        title: "Sifatli moylar",
        desc: "Original va sertifikatlangan mahsulotlar",
      },
      {
        icon: "⚡",
        title: "Tez xizmat",
        desc: "Kutmasdan, qulay vaqtda",
      },
    ],
  },

  catalog: {
    title: "KATALOG",
    subtitle: "Mahsulotlar va videolar",
    sectionLabel: "Mahsulotlar",
  },

  catalogItems: [
    {
      id: 1,
      type: "video",
      title: "Moy almashtirish",
      thumb: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop",
      src: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
    {
      id: 2,
      type: "image",
      title: "Motor moyi",
      thumb: "https://images.unsplash.com/photo-1619642751034-765dfdf7f58e?w=400&h=400&fit=crop",
      src: "https://images.unsplash.com/photo-1619642751034-765dfdf7f58e?w=800&h=800&fit=crop",
    },
    {
      id: 3,
      type: "video",
      title: "Avtomobil xizmati",
      thumb: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop",
      src: "https://www.w3schools.com/html/movie.mp4",
    },
    {
      id: 4,
      type: "image",
      title: "Moy filtrlari",
      thumb: "https://images.unsplash.com/photo-1625047509248-ec889c063d24?w=400&h=400&fit=crop",
      src: "https://images.unsplash.com/photo-1625047509248-ec889c063d24?w=800&h=800&fit=crop",
    },
    {
      id: 5,
      type: "image",
      title: "Dvigatel parvarishi",
      thumb: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop",
      src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=800&fit=crop",
    },
    {
      id: 6,
      type: "video",
      title: "Hardoil xizmati",
      thumb: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=400&fit=crop",
      src: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  ],

  other: {
    title: "BOSHQA",
    subtitle: "Qo'shimcha imkoniyatlar",
    menu: [
      {
        id: "location",
        icon: "📍",
        label: "Manzil va filiallar",
      },
      {
        id: "feedback",
        icon: "💬",
        label: "Taklif va shikoyatlar",
      },
      {
        id: "instagram",
        icon: "📸",
        label: "Hardoil rasmiy Instagram",
      },
    ],
  },

  location: {
    title: "Manzil va filiallar",
    address: "Toshkent sh., placeholder ko'cha, 1-uy",
    workHours: "Dush–Shan: 09:00 – 20:00",
    phone: "+998 90 000 00 00",
    mapUrl: "https://maps.google.com/?q=Toshkent",
  },

  feedback: {
    title: "Taklif va shikoyatlar",
    subtitle: "Fikringiz biz uchun muhim",
    fields: {
      name: "Ismingiz",
      phone: "Telefon raqam",
      message: "Xabar",
    },
    submit: "Yuborish",
    success: "Xabaringiz yuborildi! Tez orada javob beramiz.",
    error: "Xatolik yuz berdi. Qayta urinib ko'ring.",
  },

  instagram: {
    url: "https://instagram.com/hardoil",
    label: "Instagram sahifasiga o'tish",
  },
};
