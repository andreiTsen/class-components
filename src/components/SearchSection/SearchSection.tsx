'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { submitSearchAction } from '../../actions/searchAction';
import { getAppLocale } from '../../i18n/pathname';
import { usePathname } from '../../i18n/navigation';
import { getSearchTermFromSearchParameters } from '../../utils/pokemonSearchParameters';
import './SearchSection.css';

function SearchSection() {
  const locale = getAppLocale(useLocale());
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const t = useTranslations('Search');
  const currentSearch = searchParameters.toString();
  const searchTerm = getSearchTermFromSearchParameters(searchParameters);

  return (
    <section className="search-section" aria-labelledby="search-title">
      <h1 id="search-title">{t('title')}</h1>
      <form className="search-form" action={submitSearchAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="pathname" value={pathname} />
        <input type="hidden" name="currentSearch" value={currentSearch} />
        <input
          key={searchTerm}
          name="search"
          type="search"
          placeholder={t('placeholder')}
          defaultValue={searchTerm}
        />
        <button type="submit">{t('submit')}</button>
      </form>
    </section>
  );
}

export default SearchSection;
