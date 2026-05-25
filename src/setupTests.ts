import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

type LocalStorageMock = Pick<
  Storage,
  'clear' | 'getItem' | 'removeItem' | 'setItem'
>;

export const localStorageMock = ((): LocalStorageMock => {
  let store: Record<string, string> = {};

  return {
    clear: vi.fn(() => {
      store = {};
    }),
    getItem: vi.fn((key: string) => store[key] ?? null),
    removeItem: vi.fn((key: string) => {
      const { [key]: _removedValue, ...nextStore } = store;
      store = nextStore;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
