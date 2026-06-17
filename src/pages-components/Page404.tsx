import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { getAppLocale, getLocalizedPathname } from '../i18n/pathname';
import './Page404.css';

function Page404() {
  const locale = getAppLocale(useLocale());
  const t = useTranslations('NotFound');

  return (
    <main className="page not-found-page">
      <section className="not-found-section" aria-labelledby="not-found-title">
        <span>404</span>
        <h1 id="not-found-title">{t('title')}</h1>
        <p>{t('description')}</p>
        <Link href={getLocalizedPathname('/', locale)}>{t('back')}</Link>
      </section>
    </main>
  );
}

export default Page404;
