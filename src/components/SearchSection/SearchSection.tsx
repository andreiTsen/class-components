import { useLocale, useTranslations } from 'next-intl';
import { submitSearchAction } from '../../actions/searchAction';
import { getAppLocale } from '../../i18n/pathname';
import './SearchSection.css';

type SearchSectionProperties = {
  currentSearchParameters?: URLSearchParams;
  pathname?: string;
  storedSearchTerm?: string;
};

function SearchSection({
  currentSearchParameters = new URLSearchParams(),
  pathname = '/',
  storedSearchTerm = '',
}: SearchSectionProperties) {
  const locale = getAppLocale(useLocale());
  const t = useTranslations('Search');

  return (
    <section className="search-section" aria-labelledby="search-title">
      <h1 id="search-title">{t('title')}</h1>
      <form className="search-form" action={submitSearchAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="pathname" value={pathname} />
        <input
          type="hidden"
          name="currentSearch"
          value={currentSearchParameters.toString()}
        />
        <input
          name="search"
          type="search"
          placeholder={t('placeholder')}
          defaultValue={storedSearchTerm}
        />
        <button type="submit">{t('submit')}</button>
      </form>
    </section>
  );
}

export default SearchSection;
