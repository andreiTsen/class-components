import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import React, { useSyncExternalStore } from 'react';

type LocalStorageMock = {
  clear: () => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

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

const NAVIGATION_EVENT = 'next-navigation';

const notifyNavigationListeners = (): void => {
  globalThis.dispatchEvent(new Event(NAVIGATION_EVENT));
};

const updateHistory = (
  method: 'pushState' | 'replaceState',
  href: string
): void => {
  const url = new URL(href, globalThis.location.href);
  globalThis.history[method]({}, '', url);
  notifyNavigationListeners();
};

const subscribeToNavigation = (listener: () => void): (() => void) => {
  globalThis.addEventListener(NAVIGATION_EVENT, listener);
  globalThis.addEventListener('popstate', listener);

  return (): void => {
    globalThis.removeEventListener(NAVIGATION_EVENT, listener);
    globalThis.removeEventListener('popstate', listener);
  };
};

const getPathnameSnapshot = (): string => globalThis.location.pathname;

const getSearchSnapshot = (): string => globalThis.location.search;

type MockRouter = {
  back: () => void;
  forward: () => void;
  prefetch: ReturnType<typeof vi.fn>;
  push: (href: string, options?: { locale?: string }) => void;
  refresh: ReturnType<typeof vi.fn>;
  replace: (href: string, options?: { locale?: string }) => void;
};

type MockNavigationModule = {
  usePathname: () => string;
  useRouter: () => MockRouter;
  useSearchParams: () => URLSearchParams;
};

vi.mock(
  'next/navigation',
  (): MockNavigationModule => ({
    usePathname: (): string =>
      useSyncExternalStore(
        subscribeToNavigation,
        getPathnameSnapshot,
        getPathnameSnapshot
      ),
    useRouter: (): MockRouter => ({
      back: (): void => {
        globalThis.history.back();
        notifyNavigationListeners();
      },
      forward: (): void => {
        globalThis.history.forward();
        notifyNavigationListeners();
      },
      prefetch: vi.fn(),
      push: (href: string): void => {
        updateHistory('pushState', href);
      },
      refresh: vi.fn(),
      replace: (href: string): void => {
        updateHistory('replaceState', href);
      },
    }),
    useSearchParams: (): URLSearchParams => {
      const search = useSyncExternalStore(
        subscribeToNavigation,
        getSearchSnapshot,
        getSearchSnapshot
      );

      return new URLSearchParams(search);
    },
  })
);

type MockLinkProperties = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> & {
  children: ReactNode;
  href: string;
  locale?: string;
};

type MockLinkModule = {
  default: (properties: MockLinkProperties) => React.ReactElement;
};

type MockI18nNavigationModule = {
  Link: (properties: MockLinkProperties) => React.ReactElement;
  redirect: ReturnType<typeof vi.fn>;
  usePathname: () => string;
  useRouter: () => MockRouter;
};

const getHrefWithLocale = (href: string, locale?: string): string => {
  if (locale === undefined) {
    return href;
  }

  const [pathname = '/', search = ''] = href.split('?');
  const localizedPathname =
    pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;

  return search ? `${localizedPathname}?${search}` : localizedPathname;
};

const renderMockLink = ({
  children,
  href,
  locale,
  onClick,
  ...properties
}: MockLinkProperties): React.ReactElement => {
  const localizedHref = getHrefWithLocale(href, locale);

  return React.createElement(
    'a',
    {
      href: localizedHref,
      onClick: (event: React.MouseEvent<HTMLAnchorElement>): void => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        updateHistory('pushState', localizedHref);
      },
      ...properties,
    },
    children
  );
};

const getPathnameWithoutLocaleSnapshot = (): string => {
  return getPathnameSnapshot().replace(/^\/(en|ru)(?=\/|$)/, '') || '/';
};

const getMockI18nRouter = (): MockRouter => ({
  back: (): void => {
    globalThis.history.back();
    notifyNavigationListeners();
  },
  forward: (): void => {
    globalThis.history.forward();
    notifyNavigationListeners();
  },
  prefetch: vi.fn(),
  push: (href: string, options?: { locale?: string }): void => {
    updateHistory('pushState', getHrefWithLocale(href, options?.locale));
  },
  refresh: vi.fn(),
  replace: (href: string, options?: { locale?: string }): void => {
    updateHistory('replaceState', getHrefWithLocale(href, options?.locale));
  },
});

vi.mock(
  'next/link',
  (): MockLinkModule => ({
    default: renderMockLink,
  })
);

vi.mock(
  './i18n/navigation',
  (): MockI18nNavigationModule => ({
    Link: renderMockLink,
    redirect: vi.fn(),
    usePathname: (): string =>
      useSyncExternalStore(
        subscribeToNavigation,
        getPathnameWithoutLocaleSnapshot,
        getPathnameWithoutLocaleSnapshot
      ),
    useRouter: getMockI18nRouter,
  })
);

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
