'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '../../i18n/navigation';
import { routing, type AppLocale } from '../../i18n/routing';
import { getAppLocale } from '../../i18n/pathname';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const locale = getAppLocale(useLocale());
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const t = useTranslations('Header');

  const handleLocaleChange = (nextLocale: AppLocale): void => {
    const search = searchParameters.toString();
    const href = search ? `${pathname}?${search}` : pathname;

    router.push(href, { locale: nextLocale });
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
