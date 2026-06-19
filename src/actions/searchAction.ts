'use server';

import { redirect } from 'next/navigation';
import { routing, type AppLocale } from '../i18n/routing';

const SEARCH_FIELD_NAME = 'search';
const CURRENT_SEARCH_FIELD_NAME = 'currentSearch';
const LOCALE_FIELD_NAME = 'locale';
const PATHNAME_FIELD_NAME = 'pathname';

const getFormValue = (formData: FormData, name: string): string => {
  const value = formData.get(name);

  return typeof value === 'string' ? value : '';
};

const appLocales: readonly string[] = routing.locales;

const isAppLocale = (locale: string): locale is AppLocale => {
  return appLocales.includes(locale);
};

const getAppLocale = (locale: string): AppLocale => {
  return isAppLocale(locale) ? locale : routing.defaultLocale;
};

export async function submitSearchAction(formData: FormData): Promise<void> {
  await Promise.resolve();

  const locale = getAppLocale(getFormValue(formData, LOCALE_FIELD_NAME));
  const pathname = getFormValue(formData, PATHNAME_FIELD_NAME) || '/';
  const currentSearchParameters = new URLSearchParams(
    getFormValue(formData, CURRENT_SEARCH_FIELD_NAME)
  );
  const searchTerm = getFormValue(formData, SEARCH_FIELD_NAME).trim();

  currentSearchParameters.set('page', '1');

  if (searchTerm) {
    currentSearchParameters.set('search', searchTerm);
  } else {
    currentSearchParameters.delete('search');
  }

  const query = currentSearchParameters.toString();
  const normalizedPathname = pathname.startsWith('/') ? pathname : '/';
  const localizedPathname =
    normalizedPathname === '/'
      ? `/${locale}`
      : `/${locale}${normalizedPathname}`;

  redirect(query ? `${localizedPathname}?${query}` : localizedPathname);
}
