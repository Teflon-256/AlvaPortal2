import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Define available languages
export const languages = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  tr: 'Türkçe',
  pl: 'Polski',
  nl: 'Nederlands'
};

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "portfolio": "Portfolio",
      "referrals": "Referrals",
      "profile": "Profile",
      "signOut": "Sign Out",
      "getStarted": "Get Started",
      "signIn": "Sign In",
      
      // Landing page
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Multi-Account Trading Platform",
      "heroDescription": "Connect multiple trading accounts, track performance, and participate in copy trading with our comprehensive platform.",
      "whyChooseUs": "Why Choose AlvaCapital?",
      "multiPlatform": "Multi-Platform Support",
      "multiPlatformDesc": "Connect accounts from Exness, Bybit, and Binance all in one place.",
      "copyTrading": "Copy Trading",
      "copyTradingDesc": "Follow successful traders and copy their strategies automatically.",
      "realTimeTracking": "Real-Time Tracking",
      "realTimeTrackingDesc": "Monitor your portfolio performance with live updates and analytics.",
      "referralProgram": "Referral Program",
      "referralProgramDesc": "Earn commissions by referring new traders to our platform.",
      
      // Dashboard
      "welcomeBack": "Welcome Back",
      "portfolioValue": "Portfolio Value",
      "todaysPnL": "Today's P&L",
      "earnings": "Earnings",
      "tradingAccounts": "Trading Accounts",
      "startTrading": "Open Trading Account",
      "algorithmicTrading": "Algorithmic Trading",
      "noAccountsMessage": "Ready to connect your first account?",
      "noAccountsSubtitle": "Seamless integration with leading trading platforms.",
      "beginTradingJourney": "Begin your trading journey with these trusted platforms.",
      "startTradingAction": "Start trading",
      
      // Trading Account Connection
      "addAccount": "Add Account",
      "selectBroker": "Select Broker",
      "connectCopyTradingAccount": "Connect Copy Trading Account",
      "nameOfBroker": "Name of Broker",
      "submitBroker": "Submit Broker Request",
      "connectAccount": "Connect Account",
      
      // Contact
      "contactUs": "Contact Us",
      "whatsappSupport": "WhatsApp Support",
      "getInTouch": "Get in touch with us for any questions or support.",
      
      // Admin
      "adminDashboard": "Admin Dashboard",
      "brokerRequests": "Broker Requests",
      "noPendingRequests": "No pending requests",
      "requestedBy": "Requested by",
      "brokerName": "Broker Name",
      "requestDate": "Request Date",
      "status": "Status",
      "pending": "Pending",
      "approved": "Approved",
      "rejected": "Rejected",
      
      // Forms
      "submit": "Submit",
      "cancel": "Cancel",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "view": "View",
      "close": "Close",
      
      // Common
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "warning": "Warning",
      "info": "Information",
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort",
      "refresh": "Refresh",
      "language": "Language",
      "theme": "Theme",
      "darkMode": "Dark Mode",
      "lightMode": "Light Mode"
    }
  },
  es: {
    translation: {
      // Navigation
      "home": "Inicio",
      "portfolio": "Portafolio",
      "referrals": "Referencias",
      "profile": "Perfil",
      "signOut": "Cerrar Sesión",
      "getStarted": "Comenzar",
      "signIn": "Iniciar Sesión",
      
      // Landing page
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Plataforma de Trading Multi-Cuenta",
      "heroDescription": "Conecta múltiples cuentas de trading, rastrea el rendimiento y participa en copy trading con nuestra plataforma integral.",
      "whyChooseUs": "¿Por qué elegir AlvaCapital?",
      "multiPlatform": "Soporte Multi-Plataforma",
      "multiPlatformDesc": "Conecta cuentas de Exness, Bybit y Binance en un solo lugar.",
      "copyTrading": "Copy Trading",
      "copyTradingDesc": "Sigue a traders exitosos y copia sus estrategias automáticamente.",
      "realTimeTracking": "Seguimiento en Tiempo Real",
      "realTimeTrackingDesc": "Monitorea el rendimiento de tu portafolio con actualizaciones en vivo y análisis.",
      "referralProgram": "Programa de Referencias",
      "referralProgramDesc": "Gana comisiones refiriendo nuevos traders a nuestra plataforma.",
      
      // Dashboard
      "welcomeBack": "Bienvenido de Nuevo",
      "portfolioValue": "Valor del Portafolio",
      "todaysPnL": "P&L de Hoy",
      "earnings": "Ganancias",
      "tradingAccounts": "Cuentas de Trading",
      "startTrading": "Comenzar Trading",
      "algorithmicTrading": "Trading Algorítmico",
      "noAccountsMessage": "¿Listo para conectar tu primera cuenta?",
      "noAccountsSubtitle": "Integración perfecta con las principales plataformas de trading.",
      "beginTradingJourney": "Comienza tu viaje de trading con estas plataformas confiables.",
      "startTradingAction": "Comenzar trading",
      
      // Trading Account Connection
      "addAccount": "Agregar Cuenta",
      "selectBroker": "Seleccionar Broker",
      "connectCopyTradingAccount": "Conectar Cuenta de Copy Trading",
      "nameOfBroker": "Nombre del Broker",
      "submitBroker": "Enviar Solicitud de Broker",
      "connectAccount": "Conectar Cuenta",
      
      // Contact
      "contactUs": "Contáctanos",
      "whatsappSupport": "Soporte WhatsApp",
      "getInTouch": "Ponte en contacto con nosotros para cualquier pregunta o soporte.",
      
      // Common
      "loading": "Cargando...",
      "error": "Error",
      "success": "Éxito",
      "warning": "Advertencia",
      "info": "Información",
      "language": "Idioma",
      "theme": "Tema",
      "darkMode": "Modo Oscuro",
      "lightMode": "Modo Claro"
    }
  },
  fr: {
    translation: {
      "home": "Accueil",
      "portfolio": "Portefeuille",
      "referrals": "Parrainages",
      "profile": "Profil",
      "signOut": "Se Déconnecter",
      "getStarted": "Commencer",
      "signIn": "Se Connecter",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Plateforme de Trading Multi-Comptes",
      "heroDescription": "Connectez plusieurs comptes de trading, suivez les performances et participez au copy trading avec notre plateforme complète.",
      "whyChooseUs": "Pourquoi choisir AlvaCapital?",
      "multiPlatformDesc": "Connectez les comptes d'Exness, Bybit et Binance en un seul endroit.",
      "welcomeBack": "Bon Retour",
      "portfolioValue": "Valeur du Portefeuille",
      "todaysPnL": "P&L d'Aujourd'hui",
      "startTrading": "Commencer le Trading",
      "addAccount": "Ajouter un Compte",
      "selectBroker": "Sélectionner un Courtier",
      "contactUs": "Nous Contacter",
      "whatsappSupport": "Support WhatsApp",
      "loading": "Chargement...",
      "language": "Langue"
    }
  },
  de: {
    translation: {
      "home": "Startseite",
      "portfolio": "Portfolio",
      "referrals": "Empfehlungen",
      "profile": "Profil",
      "signOut": "Abmelden",
      "getStarted": "Loslegen",
      "signIn": "Anmelden",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Multi-Konto Trading-Plattform",
      "heroDescription": "Verbinden Sie mehrere Trading-Konten, verfolgen Sie die Performance und nehmen Sie am Copy Trading mit unserer umfassenden Plattform teil.",
      "whyChooseUs": "Warum AlvaCapital wählen?",
      "multiPlatformDesc": "Verbinden Sie Konten von Exness, Bybit und Binance an einem Ort.",
      "welcomeBack": "Willkommen zurück",
      "portfolioValue": "Portfolio-Wert",
      "todaysPnL": "Heutiger P&L",
      "startTrading": "Trading Starten",
      "addAccount": "Konto Hinzufügen",
      "selectBroker": "Broker Auswählen",
      "contactUs": "Kontaktieren Sie Uns",
      "whatsappSupport": "WhatsApp Support",
      "loading": "Wird geladen...",
      "language": "Sprache"
    }
  },
  it: {
    translation: {
      "home": "Home",
      "portfolio": "Portafoglio",
      "referrals": "Referenze",
      "profile": "Profilo",
      "signOut": "Esci",
      "getStarted": "Inizia",
      "signIn": "Accedi",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Piattaforma di Trading Multi-Account",
      "heroDescription": "Collega più conti di trading, tieni traccia delle prestazioni e partecipa al copy trading con la nostra piattaforma completa.",
      "whyChooseUs": "Perché scegliere AlvaCapital?",
      "multiPlatformDesc": "Collega conti da Exness, Bybit e Binance in un unico posto.",
      "welcomeBack": "Bentornato",
      "portfolioValue": "Valore del Portafoglio",
      "todaysPnL": "P&L di Oggi",
      "startTrading": "Inizia il Trading",
      "addAccount": "Aggiungi Conto",
      "selectBroker": "Seleziona Broker",
      "contactUs": "Contattaci",
      "whatsappSupport": "Supporto WhatsApp",
      "loading": "Caricamento...",
      "language": "Lingua"
    }
  },
  pt: {
    translation: {
      "home": "Início",
      "portfolio": "Portfólio",
      "referrals": "Indicações",
      "profile": "Perfil",
      "signOut": "Sair",
      "getStarted": "Começar",
      "signIn": "Entrar",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Plataforma de Trading Multi-Conta",
      "heroDescription": "Conecte múltiplas contas de trading, acompanhe o desempenho e participe do copy trading com nossa plataforma abrangente.",
      "whyChooseUs": "Por que escolher AlvaCapital?",
      "multiPlatformDesc": "Conecte contas da Exness, Bybit e Binance em um só lugar.",
      "welcomeBack": "Bem-vindo de Volta",
      "portfolioValue": "Valor do Portfólio",
      "todaysPnL": "P&L de Hoje",
      "startTrading": "Começar Trading",
      "addAccount": "Adicionar Conta",
      "selectBroker": "Selecionar Corretora",
      "contactUs": "Entre em Contato",
      "whatsappSupport": "Suporte WhatsApp",
      "loading": "Carregando...",
      "language": "Idioma"
    }
  },
  ru: {
    translation: {
      "home": "Главная",
      "portfolio": "Портфель",
      "referrals": "Рефералы",
      "profile": "Профиль",
      "signOut": "Выйти",
      "getStarted": "Начать",
      "signIn": "Войти",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Мульти-Аккаунт Торговая Платформа",
      "heroDescription": "Подключите несколько торговых счетов, отслеживайте производительность и участвуйте в копи-трейдинге с нашей комплексной платформой.",
      "whyChooseUs": "Почему выбрать AlvaCapital?",
      "multiPlatformDesc": "Подключите счета Exness, Bybit и Binance в одном месте.",
      "welcomeBack": "Добро пожаловать обратно",
      "portfolioValue": "Стоимость Портфеля",
      "todaysPnL": "Сегодняшний P&L",
      "startTrading": "Начать Торговлю",
      "addAccount": "Добавить Счет",
      "selectBroker": "Выбрать Брокера",
      "contactUs": "Связаться с Нами",
      "whatsappSupport": "Поддержка WhatsApp",
      "loading": "Загрузка...",
      "language": "Язык"
    }
  },
  zh: {
    translation: {
      "home": "首页",
      "portfolio": "投资组合",
      "referrals": "推荐",
      "profile": "个人资料",
      "signOut": "退出",
      "getStarted": "开始",
      "signIn": "登录",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "多账户交易平台",
      "heroDescription": "连接多个交易账户，跟踪表现，并通过我们的综合平台参与复制交易。",
      "whyChooseUs": "为什么选择AlvaCapital？",
      "multiPlatformDesc": "在一个地方连接Exness、Bybit和Binance账户。",
      "welcomeBack": "欢迎回来",
      "portfolioValue": "投资组合价值",
      "todaysPnL": "今日盈亏",
      "startTrading": "开始交易",
      "addAccount": "添加账户",
      "selectBroker": "选择经纪商",
      "contactUs": "联系我们",
      "whatsappSupport": "WhatsApp支持",
      "loading": "加载中...",
      "language": "语言"
    }
  },
  ja: {
    translation: {
      "home": "ホーム",
      "portfolio": "ポートフォリオ",
      "referrals": "紹介",
      "profile": "プロフィール",
      "signOut": "サインアウト",
      "getStarted": "開始",
      "signIn": "サインイン",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "マルチアカウント取引プラットフォーム",
      "heroDescription": "複数の取引アカウントを接続し、パフォーマンスを追跡し、包括的なプラットフォームでコピートレーディングに参加してください。",
      "whyChooseUs": "なぜAlvaCapitalを選ぶのか？",
      "multiPlatformDesc": "Exness、Bybit、Binanceのアカウントを一箇所で接続。",
      "welcomeBack": "おかえりなさい",
      "portfolioValue": "ポートフォリオ価値",
      "todaysPnL": "今日のP&L",
      "startTrading": "取引開始",
      "addAccount": "アカウント追加",
      "selectBroker": "ブローカー選択",
      "contactUs": "お問い合わせ",
      "whatsappSupport": "WhatsAppサポート",
      "loading": "読み込み中...",
      "language": "言語"
    }
  },
  ko: {
    translation: {
      "home": "홈",
      "portfolio": "포트폴리오",
      "referrals": "추천",
      "profile": "프로필",
      "signOut": "로그아웃",
      "getStarted": "시작하기",
      "signIn": "로그인",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "멀티 계정 거래 플랫폼",
      "heroDescription": "여러 거래 계정을 연결하고 성과를 추적하며 포괄적인 플랫폼으로 카피 트레이딩에 참여하세요.",
      "whyChooseUs": "왜 AlvaCapital을 선택해야 할까요?",
      "multiPlatformDesc": "Exness, Bybit, Binance 계정을 한 곳에서 연결하세요.",
      "welcomeBack": "다시 오신 것을 환영합니다",
      "portfolioValue": "포트폴리오 가치",
      "todaysPnL": "오늘의 손익",
      "startTrading": "거래 시작",
      "addAccount": "계정 추가",
      "selectBroker": "브로커 선택",
      "contactUs": "문의하기",
      "whatsappSupport": "WhatsApp 지원",
      "loading": "로딩 중...",
      "language": "언어"
    }
  },
  ar: {
    translation: {
      "home": "الرئيسية",
      "portfolio": "المحفظة",
      "referrals": "الإحالات",
      "profile": "الملف الشخصي",
      "signOut": "تسجيل الخروج",
      "getStarted": "البدء",
      "signIn": "تسجيل الدخول",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "منصة التداول متعددة الحسابات",
      "heroDescription": "اربط عدة حسابات تداول وتتبع الأداء وشارك في التداول بالنسخ مع منصتنا الشاملة.",
      "whyChooseUs": "لماذا تختار AlvaCapital؟",
      "multiPlatformDesc": "اربط حسابات Exness و Bybit و Binance في مكان واحد.",
      "welcomeBack": "مرحباً بعودتك",
      "portfolioValue": "قيمة المحفظة",
      "todaysPnL": "ربح وخسارة اليوم",
      "startTrading": "بدء التداول",
      "addAccount": "إضافة حساب",
      "selectBroker": "اختيار الوسيط",
      "contactUs": "اتصل بنا",
      "whatsappSupport": "دعم واتساب",
      "loading": "جاري التحميل...",
      "language": "اللغة"
    }
  },
  hi: {
    translation: {
      "home": "होम",
      "portfolio": "पोर्टफोलियो",
      "referrals": "रेफरल",
      "profile": "प्रोफाइल",
      "signOut": "साइन आउट",
      "getStarted": "शुरू करें",
      "signIn": "साइन इन",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "मल्टी अकाउंट ट्रेडिंग प्लेटफॉर्म",
      "heroDescription": "कई ट्रेडिंग अकाउंट्स को कनेक्ट करें, प्रदर्शन को ट्रैक करें और हमारे व्यापक प्लेटफॉर्म के साथ कॉपी ट्रेडिंग में भाग लें।",
      "whyChooseUs": "AlvaCapital क्यों चुनें?",
      "multiPlatformDesc": "Exness, Bybit और Binance अकाउंट्स को एक ही स्थान पर कनेक्ट करें।",
      "welcomeBack": "वापस आपका स्वागत है",
      "portfolioValue": "पोर्टफोलियो मूल्य",
      "todaysPnL": "आज का P&L",
      "startTrading": "ट्रेडिंग शुरू करें",
      "addAccount": "खाता जोड़ें",
      "selectBroker": "ब्रोकर चुनें",
      "contactUs": "हमसे संपर्क करें",
      "whatsappSupport": "WhatsApp सपोर्ट",
      "loading": "लोड हो रहा है...",
      "language": "भाषा"
    }
  },
  tr: {
    translation: {
      "home": "Ana Sayfa",
      "portfolio": "Portföy",
      "referrals": "Referanslar",
      "profile": "Profil",
      "signOut": "Çıkış Yap",
      "getStarted": "Başlayın",
      "signIn": "Giriş Yap",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Multi-Hesap İşlem Platformu",
      "heroDescription": "Birden fazla işlem hesabını bağlayın, performansı takip edin ve kapsamlı platformumuzla kopyala ticaretine katılın.",
      "whyChooseUs": "Neden AlvaCapital'i seçmelisiniz?",
      "multiPlatformDesc": "Exness, Bybit ve Binance hesaplarını tek bir yerde bağlayın.",
      "welcomeBack": "Tekrar Hoş Geldiniz",
      "portfolioValue": "Portföy Değeri",
      "todaysPnL": "Bugünün K&Z",
      "startTrading": "İşleme Başla",
      "addAccount": "Hesap Ekle",
      "selectBroker": "Broker Seç",
      "contactUs": "Bize Ulaşın",
      "whatsappSupport": "WhatsApp Destek",
      "loading": "Yükleniyor...",
      "language": "Dil"
    }
  },
  pl: {
    translation: {
      "home": "Strona Główna",
      "portfolio": "Portfel",
      "referrals": "Polecenia",
      "profile": "Profil",
      "signOut": "Wyloguj",
      "getStarted": "Rozpocznij",
      "signIn": "Zaloguj",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Platforma Handlowa Multi-Konto",
      "heroDescription": "Połącz wiele kont handlowych, śledź wydajność i uczestnicz w copy tradingu dzięki naszej kompleksowej platformie.",
      "whyChooseUs": "Dlaczego wybrać AlvaCapital?",
      "multiPlatformDesc": "Połącz konta z Exness, Bybit i Binance w jednym miejscu.",
      "welcomeBack": "Witamy ponownie",
      "portfolioValue": "Wartość Portfela",
      "todaysPnL": "Dzisiejszy P&L",
      "startTrading": "Rozpocznij Handel",
      "addAccount": "Dodaj Konto",
      "selectBroker": "Wybierz Brokera",
      "contactUs": "Skontaktuj się z Nami",
      "whatsappSupport": "Wsparcie WhatsApp",
      "loading": "Ładowanie...",
      "language": "Język"
    }
  },
  nl: {
    translation: {
      "home": "Home",
      "portfolio": "Portfolio",
      "referrals": "Verwijzingen",
      "profile": "Profiel",
      "signOut": "Uitloggen",
      "getStarted": "Beginnen",
      "signIn": "Inloggen",
      "heroTitle": "AlvaCapital",
      "heroSubtitle": "Multi-Account Handelsplatform",
      "heroDescription": "Verbind meerdere handelsaccounts, volg prestaties en neem deel aan copy trading met ons uitgebreide platform.",
      "whyChooseUs": "Waarom AlvaCapital kiezen?",
      "multiPlatformDesc": "Verbind accounts van Exness, Bybit en Binance op één plek.",
      "welcomeBack": "Welkom terug",
      "portfolioValue": "Portfolio Waarde",
      "todaysPnL": "Vandaag's W&V",
      "startTrading": "Begin met Handelen",
      "addAccount": "Account Toevoegen",
      "selectBroker": "Broker Selecteren",
      "contactUs": "Neem Contact Op",
      "whatsappSupport": "WhatsApp Ondersteuning",
      "loading": "Laden...",
      "language": "Taal"
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;