'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from '../../context/useTheme';
import { Link } from '../../i18n/navigation';
import { getAppLocale } from '../../i18n/pathname';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Header.css';

function Header() {
  const { theme, toggleTheme } = useTheme();
  const locale = getAppLocale(useLocale());
  const t = useTranslations('Header');
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <header className="page-header" aria-label={t('pageHeader')}>
      <div className="page-header-top">
        <h1>{t('title')}</h1>
        <div className="page-header-actions">
          <LanguageSwitcher />
          <button
            className="theme-toggle"
            type="button"
            aria-label={t('switchTheme', {
              theme: nextTheme === 'dark' ? t('themeDark') : t('themeLight'),
            })}
            onClick={toggleTheme}
          >
            {theme === 'light' ? t('themeDark') : t('themeLight')}
          </button>
        </div>
      </div>
      <nav className="main-nav" aria-label={t('mainNavigation')}>
        <Link href="/" locale={locale}>
          {t('home')}
        </Link>
        <Link href="/about" locale={locale}>
          {t('about')}
        </Link>
      </nav>
    </header>
  );
}

export default Header;
