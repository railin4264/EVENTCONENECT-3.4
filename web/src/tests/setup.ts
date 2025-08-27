// ==========================================
// SETUP GLOBAL PARA TESTS DE JEST
// ==========================================

import '@testing-library/jest-dom';

// ==========================================
// MOCKS PARA NEXT.JS
// ==========================================

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock de next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

// ==========================================
// MOCKS PARA BROWSER APIs
// ==========================================

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de fetch
global.fetch = jest.fn();

// Mock de URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

// Mock de URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn();

// ==========================================
// MOCKS PARA APIS EXTERNAS
// ==========================================

// Mock de Google Maps
jest.mock('@googlemaps/js-api-loader', () => ({
  Loader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue({
      Map: jest.fn(),
      Marker: jest.fn(),
      InfoWindow: jest.fn(),
      Geocoder: jest.fn(),
      PlacesService: jest.fn(),
      Autocomplete: jest.fn(),
      LatLng: jest.fn(),
      LatLngBounds: jest.fn(),
    }),
  })),
}));

// Mock de Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    img: ({ ...props }: any) => <img {...props} />,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    input: ({ ...props }: any) => <input {...props} />,
    textarea: ({ children, ...props }: any) => <textarea {...props}>{children}</textarea>,
    select: ({ children, ...props }: any) => <select {...props}>{children}</select>,
    option: ({ children, ...props }: any) => <option {...props}>{children}</option>,
    label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    h4: ({ children, ...props }: any) => <h4 {...props}>{children}</h4>,
    h5: ({ children, ...props }: any) => <h5 {...props}>{children}</h5>,
    h6: ({ children, ...props }: any) => <h6 {...props}>{children}</h6>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    ol: ({ children, ...props }: any) => <ol {...props}>{children}</ol>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    footer: ({ children, ...props }: any) => <footer {...props}>{children}</footer>,
    main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
    table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
    thead: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
    tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
    th: ({ children, ...props }: any) => <th {...props}>{children}</th>,
    td: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  })),
  useMotionValue: jest.fn((initial) => ({
    get: jest.fn(() => initial),
    set: jest.fn(),
    on: jest.fn(),
  })),
  useTransform: jest.fn((value, transform) => ({
    get: jest.fn(() => transform(value.get())),
    set: jest.fn(),
    on: jest.fn(),
  })),
  useSpring: jest.fn((value) => ({
    get: jest.fn(() => value),
    set: jest.fn(),
    on: jest.fn(),
  })),
  useMotionValueEvent: jest.fn(),
  LazyMotion: ({ children }: any) => <>{children}</>,
  domAnimation: {},
  domMax: {},
}));

// ==========================================
// MOCKS PARA HOOKS PERSONALIZADOS
// ==========================================

// Mock de useAuth
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

// Mock de usePushNotifications
jest.mock('../hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    isSupported: true,
    isSubscribed: false,
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    sendNotification: jest.fn(),
    permission: 'default',
  }),
}));

// Mock de useTheme
jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
  }),
}));

// ==========================================
// MOCKS PARA UTILIDADES
// ==========================================

// Mock de date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'dd/MM/yyyy') return '01/01/2024';
    if (formatStr === 'HH:mm') return '12:00';
    if (formatStr === 'EEEE, dd MMMM yyyy') return 'Monday, 01 January 2024';
    return '01/01/2024';
  }),
  formatDistance: jest.fn(() => '2 days ago'),
  formatRelative: jest.fn(() => 'yesterday'),
  parseISO: jest.fn((date) => new Date(date)),
  isValid: jest.fn(() => true),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
  endOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)),
}));

// Mock de uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-1234'),
  v1: jest.fn(() => 'mocked-uuid-5678'),
}));

// ==========================================
// CONFIGURACIÓN DE TESTING LIBRARY
// ==========================================

// Configurar testing library para mejor debugging
beforeEach(() => {
  // Limpiar todos los mocks antes de cada test
  jest.clearAllMocks();
  
  // Limpiar localStorage y sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Resetear fetch mock
  (global.fetch as jest.Mock).mockClear();
  
  // Configurar fetch por defecto
  (global.fetch as jest.Mock).mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  );
});

// ==========================================
// HELPERS PARA TESTS
// ==========================================

// Helper para crear un usuario mock
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  avatar: null,
  bio: 'Test bio',
  isVerified: true,
  isActive: true,
  role: 'user',
  preferences: {
    language: 'es',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
    },
    privacy: {
      profileVisibility: 'public',
      locationVisibility: 'friends',
      activityVisibility: 'friends',
    },
  },
  stats: {
    eventsCreated: 0,
    eventsAttended: 0,
    tribesJoined: 0,
    postsCreated: 0,
    reviewsGiven: 0,
    connectionsMade: 0,
    lastActive: new Date(),
  },
  level: 1,
  experience: 0,
  points: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper para crear un evento mock
export const createMockEvent = (overrides = {}) => ({
  id: 'event-123',
  title: 'Test Event',
  description: 'Test event description',
  date: new Date('2024-12-31T20:00:00Z'),
  location: {
    type: 'Point',
    coordinates: [-74.006, 40.7128],
    address: '123 Test St, Test City',
    city: 'Test City',
    country: 'Test Country',
  },
  category: 'music',
  tags: ['test', 'music'],
  maxAttendees: 100,
  currentAttendees: 0,
  price: 0,
  isPublic: true,
  isActive: true,
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper para crear una tribu mock
export const createMockTribe = (overrides = {}) => ({
  id: 'tribe-123',
  name: 'Test Tribe',
  description: 'Test tribe description',
  category: 'music',
  tags: ['test', 'music'],
  isPublic: true,
  isActive: true,
  memberCount: 0,
  maxMembers: 1000,
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ==========================================
// CONFIGURACIÓN DE CONSOLE
// ==========================================

// Suprimir warnings de console en tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ==========================================
// CONFIGURACIÓN DE TIMEOUTS
// ==========================================

// Aumentar timeout para tests complejos
jest.setTimeout(30000);

// ==========================================
// CONFIGURACIÓN DE ENVIRONMENT
// ==========================================

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';