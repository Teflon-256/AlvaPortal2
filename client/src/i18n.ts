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
      "heroSubtitle": "Professional Trading Platform",
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
      "referrals": "Referrals",
      "earnings": "Earnings",
      "tradingAccounts": "Trading Accounts",
      "startTrading": "Start Trading",
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
      "heroSubtitle": "Plataforma de Trading Profesional",
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
  }
  // Additional languages can be added here
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