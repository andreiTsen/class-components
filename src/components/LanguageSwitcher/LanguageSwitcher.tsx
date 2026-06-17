'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { routing, type AppLocale } from '../../i18n/routing';
import { getAppLocale, getLocalizedPathname } from '../../i18n/pathname';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const locale = getAppLocale(useLocale());
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const t = useTranslations('Header');

  const handleLocaleChange = (nextLocale: AppLocale): void => {
    const search = searchParameters.toString();
    const localizedPathname = getLocalizedPathname(pathname, nextLocale);

    router.push(search ? `${localizedPathname}?${search}` : localizedPathname);
  };

  return (
    <label className="language-switcher">
      <span>{t('languageLabel')}</span>
      <select
        value={locale}
        onChange={(event): void => {
          handleLocaleChange(getAppLocale(event.target.value));
        }}
      >
        {routing.locales.map((item) => (
          <option key={item} value={item}>
            {item.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;
