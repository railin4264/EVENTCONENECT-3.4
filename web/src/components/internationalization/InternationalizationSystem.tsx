import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Languages,
  // Flag,
  Settings,
  Languages as Translate,
  // Clock,
  // MapPin,
  // Users,
  // Calendar,
  // Star,
  // Heart,
  // Share,
  // Eye,
  // TrendingUp,
  // Zap,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// ===== INTERNATIONALIZATION TYPES =====
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  numberFormat: string;
  locale: string;
}

export interface LocalizedContent {
  [key: string]: {
    [languageCode: string]: string;
  };
}

export interface CulturalAdaptation {
  language: string;
  greeting: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
  timeFormat: string;
  colorScheme: 'light' | 'dark' | 'auto';
  fontFamily: string;
  animations: boolean;
}

// ===== SUPPORTED LANGUAGES =====
const supportedLanguages: Language[] = [
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: 'es-ES',
    locale: 'es-ES',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    numberFormat: 'en-US',
    locale: 'en-US',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: 'fr-FR',
    locale: 'fr-FR',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: 'de-DE',
    locale: 'de-DE',
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: 'it-IT',
    locale: 'it-IT',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: 'pt-PT',
    locale: 'pt-PT',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'SAR',
    numberFormat: 'ar-SA',
    locale: 'ar-SA',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'CNY',
    numberFormat: 'zh-CN',
    locale: 'zh-CN',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: '24h',
    currency: 'JPY',
    numberFormat: 'ja-JP',
    locale: 'ja-JP',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false,
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'KRW',
    numberFormat: 'ko-KR',
    locale: 'ko-KR',
  },
];

// ===== LOCALIZED CONTENT =====
const localizedContent: LocalizedContent = {
  // Navigation
  'nav.home': {
    es: 'Inicio',
    en: 'Home',
    fr: 'Accueil',
    de: 'Startseite',
    it: 'Home',
    pt: 'Início',
    ar: 'الرئيسية',
    zh: '首页',
    ja: 'ホーム',
    ko: '홈',
  },
  'nav.events': {
    es: 'Eventos',
    en: 'Events',
    fr: 'Événements',
    de: 'Veranstaltungen',
    it: 'Eventi',
    pt: 'Eventos',
    ar: 'الفعاليات',
    zh: '活动',
    ja: 'イベント',
    ko: '이벤트',
  },
  'nav.profile': {
    es: 'Perfil',
    en: 'Profile',
    fr: 'Profil',
    de: 'Profil',
    it: 'Profilo',
    pt: 'Perfil',
    ar: 'الملف الشخصي',
    zh: '个人资料',
    ja: 'プロフィール',
    ko: '프로필',
  },

  // Common Actions
  'action.create': {
    es: 'Crear',
    en: 'Create',
    fr: 'Créer',
    de: 'Erstellen',
    it: 'Crea',
    pt: 'Criar',
    ar: 'إنشاء',
    zh: '创建',
    ja: '作成',
    ko: '만들기',
  },
  'action.edit': {
    es: 'Editar',
    en: 'Edit',
    fr: 'Modifier',
    de: 'Bearbeiten',
    it: 'Modifica',
    pt: 'Editar',
    ar: 'تعديل',
    zh: '编辑',
    ja: '編集',
    ko: '편집',
  },
  'action.delete': {
    es: 'Eliminar',
    en: 'Delete',
    fr: 'Supprimer',
    de: 'Löschen',
    it: 'Elimina',
    pt: 'Excluir',
    ar: 'حذف',
    zh: '删除',
    ja: '削除',
    ko: '삭제',
  },

  // Event Related
  'event.title': {
    es: 'Título del Evento',
    en: 'Event Title',
    fr: "Titre de l'événement",
    de: 'Veranstaltungstitel',
    it: 'Titolo evento',
    pt: 'Título do evento',
    ar: 'عنوان الفعالية',
    zh: '活动标题',
    ja: 'イベントタイトル',
    ko: '이벤트 제목',
  },
  'event.description': {
    es: 'Descripción',
    en: 'Description',
    fr: 'Description',
    de: 'Beschreibung',
    it: 'Descrizione',
    pt: 'Descrição',
    ar: 'الوصف',
    zh: '描述',
    ja: '説明',
    ko: '설명',
  },
  'event.date': {
    es: 'Fecha',
    en: 'Date',
    fr: 'Date',
    de: 'Datum',
    it: 'Data',
    pt: 'Data',
    ar: 'التاريخ',
    zh: '日期',
    ja: '日付',
    ko: '날짜',
  },
  'event.time': {
    es: 'Hora',
    en: 'Time',
    fr: 'Heure',
    de: 'Zeit',
    it: 'Ora',
    pt: 'Hora',
    ar: 'الوقت',
    zh: '时间',
    ja: '時間',
    ko: '시간',
  },
  'event.location': {
    es: 'Ubicación',
    en: 'Location',
    fr: 'Lieu',
    de: 'Ort',
    it: 'Luogo',
    pt: 'Local',
    ar: 'الموقع',
    zh: '地点',
    ja: '場所',
    ko: '위치',
  },

  // Messages
  'message.welcome': {
    es: '¡Bienvenido a EventConnect!',
    en: 'Welcome to EventConnect!',
    fr: 'Bienvenue sur EventConnect !',
    de: 'Willkommen bei EventConnect!',
    it: 'Benvenuto su EventConnect!',
    pt: 'Bem-vindo ao EventConnect!',
    ar: 'مرحباً بك في EventConnect!',
    zh: '欢迎使用EventConnect！',
    ja: 'EventConnectへようこそ！',
    ko: 'EventConnect에 오신 것을 환영합니다!',
  },
  'message.loading': {
    es: 'Cargando...',
    en: 'Loading...',
    fr: 'Chargement...',
    de: 'Laden...',
    it: 'Caricamento...',
    pt: 'Carregando...',
    ar: 'جاري التحميل...',
    zh: '加载中...',
    ja: '読み込み中...',
    ko: '로딩 중...',
  },
  'message.noEvents': {
    es: 'No se encontraron eventos',
    en: 'No events found',
    fr: 'Aucun événement trouvé',
    de: 'Keine Veranstaltungen gefunden',
    it: 'Nessun evento trovato',
    pt: 'Nenhum evento encontrado',
    ar: 'لم يتم العثور على فعاليات',
    zh: '未找到活动',
    ja: 'イベントが見つかりません',
    ko: '이벤트를 찾을 수 없습니다',
  },
};

// ===== LANGUAGE SELECTOR COMPONENT =====
const LanguageSelector: React.FC<{
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  className?: string;
}> = ({ selectedLanguage, onLanguageChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLang = supportedLanguages.find(
    lang => lang.code === selectedLanguage
  );

  return (
    <div className={cn('relative', className)}>
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200'
      >
        <span className='text-2xl'>{selectedLang?.flag}</span>
        <div className='text-left'>
          <div className='text-white font-medium'>
            {selectedLang?.nativeName}
          </div>
          <div className='text-gray-300 text-sm'>{selectedLang?.name}</div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className='w-4 h-4 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </motion.div>
      </button>

      {/* Language Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='absolute top-full mt-2 right-0 w-80 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50'
          >
            <div className='p-2'>
              {supportedLanguages.map(language => (
                <button
                  key={language.code}
                  onClick={() => {
                    onLanguageChange(language.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                    selectedLanguage === language.code
                      ? 'bg-cyan-500/20 border border-cyan-400/50'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className='text-2xl'>{language.flag}</span>
                  <div className='flex-1'>
                    <div className='font-medium text-white'>
                      {language.nativeName}
                    </div>
                    <div className='text-sm text-gray-300'>{language.name}</div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {language.rtl && (
                      <span className='text-xs text-orange-400 bg-orange-400/20 px-2 py-1 rounded'>
                        RTL
                      </span>
                    )}
                    {selectedLanguage === language.code && (
                      <div className='w-2 h-2 bg-cyan-400 rounded-full' />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

// ===== LOCALIZATION PREVIEW COMPONENT =====
const LocalizationPreview: React.FC<{
  language: Language;
  className?: string;
}> = ({ language, className }) => {
  const getLocalizedText = (key: string) => {
    return localizedContent[key]?.[language.code] || key;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(language.locale, options).format(date);
  };

  const formatTime = (time: string) => {
    const [hoursStr, minutesStr] = (time || '').split(':');
    const hours = parseInt(hoursStr || '0');
    const minutes = parseInt(minutesStr || '0');
    const date = new Date();
    date.setHours(hours, minutes);

    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: language.timeFormat === '12h',
    };
    return new Intl.DateTimeFormat(language.locale, options).format(date);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language.numberFormat).format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language.numberFormat, {
      style: 'currency',
      currency: language.currency,
    }).format(amount);
  };

  return (
    <Card variant='glass' className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Globe className='w-5 h-5 text-cyan-400' />
          <span>Vista Previa de Localización</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Language Info */}
        <div className='flex items-center space-x-3 p-3 bg-white/5 rounded-lg'>
          <span className='text-3xl'>{language.flag}</span>
          <div>
            <h4 className='font-medium text-white'>{language.nativeName}</h4>
            <p className='text-sm text-gray-300'>{language.name}</p>
          </div>
          <div className='ml-auto'>
            <span
              className={cn(
                'text-xs px-2 py-1 rounded',
                language.rtl
                  ? 'text-orange-400 bg-orange-400/20'
                  : 'text-green-400 bg-green-400/20'
              )}
            >
              {language.direction.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Sample Content */}
        <div className='space-y-3'>
          <h5 className='text-white font-medium'>Contenido de Ejemplo:</h5>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>
                Mensaje de Bienvenida
              </div>
              <div className='text-white'>
                {getLocalizedText('message.welcome')}
              </div>
            </div>

            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Fecha</div>
              <div className='text-white'>{formatDate(new Date())}</div>
            </div>

            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Hora</div>
              <div className='text-white'>{formatTime('14:30')}</div>
            </div>

            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Número</div>
              <div className='text-white'>{formatNumber(1234567.89)}</div>
            </div>

            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Moneda</div>
              <div className='text-white'>{formatCurrency(99.99)}</div>
            </div>

            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Formato de Fecha</div>
              <div className='text-white'>{language.dateFormat}</div>
            </div>
          </div>
        </div>

        {/* RTL Preview */}
        {language.rtl && (
          <div className='p-3 bg-orange-400/10 border border-orange-400/20 rounded-lg'>
            <div className='text-orange-400 text-sm font-medium mb-2'>
              Vista Previa RTL (Right-to-Left)
            </div>
            <div className='text-right text-white' dir='rtl'>
              هذا مثال على النص العربي مع اتجاه من اليمين إلى اليسار
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===== CULTURAL ADAPTATION COMPONENT =====
const CulturalAdaptation: React.FC<{
  language: Language;
  className?: string;
}> = ({ language, className }) => {
  const [adaptations, setAdaptations] = useState({
    greeting: true,
    dateFormat: true,
    numberFormat: true,
    currency: true,
    timeFormat: true,
    colorScheme: 'auto' as 'light' | 'dark' | 'auto',
    fontFamily: 'default',
    animations: true,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      es:
        hour < 12
          ? '¡Buenos días!'
          : hour < 18
            ? '¡Buenas tardes!'
            : '¡Buenas noches!',
      en:
        hour < 12
          ? 'Good morning!'
          : hour < 18
            ? 'Good afternoon!'
            : 'Good evening!',
      fr: hour < 12 ? 'Bonjour!' : hour < 18 ? 'Bon après-midi!' : 'Bonsoir!',
      de:
        hour < 12 ? 'Guten Morgen!' : hour < 18 ? 'Guten Tag!' : 'Guten Abend!',
      it:
        hour < 12
          ? 'Buongiorno!'
          : hour < 18
            ? 'Buon pomeriggio!'
            : 'Buonasera!',
      pt: hour < 12 ? 'Bom dia!' : hour < 18 ? 'Boa tarde!' : 'Boa noite!',
      ar: hour < 12 ? 'صباح الخير!' : hour < 18 ? 'مساء الخير!' : 'مساء الخير!',
      zh: hour < 12 ? '早上好！' : hour < 18 ? '下午好！' : '晚上好！',
      ja:
        hour < 12
          ? 'おはようございます！'
          : hour < 18
            ? 'こんにちは！'
            : 'こんばんは！',
      ko:
        hour < 12
          ? '좋은 아침입니다!'
          : hour < 18
            ? '안녕하세요!'
            : '좋은 저녁입니다!',
    };
    return greetings[language.code as keyof typeof greetings] || 'Hello!';
  };

  return (
    <Card variant='glass' className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Sparkles className='w-5 h-5 text-purple-400' />
          <span>Adaptaciones Culturales</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Greeting */}
        <div className='p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-400/20'>
          <div className='text-cyan-400 text-sm font-medium mb-1'>
            Saludo Personalizado
          </div>
          <div className='text-white text-lg'>{getGreeting()}</div>
        </div>

        {/* Cultural Settings */}
        <div className='space-y-3'>
          <h5 className='text-white font-medium'>
            Configuraciones Culturales:
          </h5>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Formato de Fecha</div>
              <div className='text-white'>{language.dateFormat}</div>
            </div>

            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Formato de Hora</div>
              <div className='text-white'>{language.timeFormat}</div>
            </div>

            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>Moneda</div>
              <div className='text-white'>{language.currency}</div>
            </div>

            <div className='p-3 bg-white/5 rounded-lg'>
              <div className='text-sm text-gray-400 mb-1'>
                Dirección del Texto
              </div>
              <div className='text-white'>
                {language.direction.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className='space-y-3'>
          <h5 className='text-white font-medium'>Personalización:</h5>

          <div className='space-y-2'>
            <label className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={adaptations.animations}
                onChange={e =>
                  setAdaptations({
                    ...adaptations,
                    animations: e.target.checked,
                  })
                }
                className='rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400'
              />
              <span className='text-white text-sm'>
                Animaciones adaptadas culturalmente
              </span>
            </label>

            <label className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={adaptations.greeting}
                onChange={e =>
                  setAdaptations({ ...adaptations, greeting: e.target.checked })
                }
                className='rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400'
              />
              <span className='text-white text-sm'>
                Saludos personalizados por hora
              </span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== MAIN INTERNATIONALIZATION SYSTEM COMPONENT =====
export const InternationalizationSystem: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [isRTL, setIsRTL] = useState(false);

  const selectedLang = supportedLanguages.find(
    lang => lang.code === selectedLanguage
  );

  useEffect(() => {
    if (selectedLang) {
      setIsRTL(selectedLang.rtl);
      document.documentElement.dir = selectedLang.direction;
      document.documentElement.lang = selectedLang.code;
    }
  }, [selectedLang]);

  // helper not used here

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6'
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-8'
        >
          <h1 className='text-4xl font-bold text-white mb-2'>
            Sistema de Internacionalización
          </h1>
          <p className='text-gray-300'>
            Soporte multiidioma y adaptaciones culturales para EventConnect
          </p>
        </motion.div>

        {/* Language Selector */}
        <div className='mb-8 flex justify-center'>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column - Localization Preview */}
          <div className='space-y-6'>
            <LocalizationPreview language={selectedLang!} />
            <CulturalAdaptation language={selectedLang!} />
          </div>

          {/* Right Column - Language Features */}
          <div className='space-y-6'>
            {/* Language Statistics */}
            <Card variant='glass' className='w-full'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Languages className='w-5 h-5 text-green-400' />
                  <span>Estadísticas de Idiomas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center p-3 bg-white/5 rounded-lg'>
                    <div className='text-2xl font-bold text-cyan-400 mb-1'>
                      {supportedLanguages.length}
                    </div>
                    <div className='text-sm text-gray-300'>
                      Idiomas Soportados
                    </div>
                  </div>
                  <div className='text-center p-3 bg-white/5 rounded-lg'>
                    <div className='text-2xl font-bold text-purple-400 mb-1'>
                      {supportedLanguages.filter(lang => lang.rtl).length}
                    </div>
                    <div className='text-sm text-gray-300'>Idiomas RTL</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Translation Progress */}
            <Card variant='glass' className='w-full'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Translate className='w-5 h-5 text-blue-400' />
                  <span>Progreso de Traducción</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {['es', 'en', 'fr', 'de'].map(langCode => {
                  const lang = supportedLanguages.find(
                    l => l.code === langCode
                  );
                  const progress =
                    langCode === 'es'
                      ? 100
                      : langCode === 'en'
                        ? 95
                        : langCode === 'fr'
                          ? 85
                          : 75;

                  return (
                    <div key={langCode} className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-lg'>{lang?.flag}</span>
                          <span className='text-white font-medium'>
                            {lang?.nativeName}
                          </span>
                        </div>
                        <span className='text-cyan-400 font-medium'>
                          {progress}%
                        </span>
                      </div>
                      <div className='w-full bg-white/10 rounded-full h-2'>
                        <motion.div
                          className='h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full'
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Current Language Info */}
            <Card variant='glass' className='w-full'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Settings className='w-5 h-5 text-yellow-400' />
                  <span>Configuración Actual</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-300'>Idioma:</span>
                  <span className='text-white font-medium'>
                    {selectedLang?.nativeName}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-300'>Dirección:</span>
                  <span className='text-white font-medium'>
                    {selectedLang?.direction.toUpperCase()}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-300'>Formato de Fecha:</span>
                  <span className='text-white font-medium'>
                    {selectedLang?.dateFormat}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-300'>Formato de Hora:</span>
                  <span className='text-white font-medium'>
                    {selectedLang?.timeFormat}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-300'>Moneda:</span>
                  <span className='text-white font-medium'>
                    {selectedLang?.currency}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-300'>Locale:</span>
                  <span className='text-white font-medium'>
                    {selectedLang?.locale}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalizationSystem;
