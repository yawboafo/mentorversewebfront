import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock as any;

// Mock window.location with delete first
delete (window as any).location;
(window as any).location = {
  href: '',
  origin: 'http://localhost:3000',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
