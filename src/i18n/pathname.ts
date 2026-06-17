import { routing, type AppLocale } from './routing';

const LOCALE_PREFIX_PATTERN = /^\/([a-z]{2})(?=\/|$)/;

export const getPathnameWithoutLocale = (pathname: string): string => {
  const nextPathname = pathname.replace(LOCALE_PREFIX_PATTERN, '');

  return nextPathname === '' ? '/' : nextPathname;
};

export const getLocaleFromPathname = (pathname: string): AppLocale => {
  const locale = LOCALE_PREFIX_PATTERN.exec(pathname)?.[1];

  return (
    routing.locales.find((item) => item === locale) ?? routing.defaultLocale
  );
};

export const getAppLocale = (locale: string): AppLocale => {
  return (
    routing.locales.find((item) => item === locale) ?? routing.defaultLocale
  );
};

export const getLocalizedPathname = (
  pathname: string,
  locale: AppLocale
): string => {
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);

  return pathnameWithoutLocale === '/'
    ? `/${locale}`
    : `/${locale}${pathnameWithoutLocale}`;
};
