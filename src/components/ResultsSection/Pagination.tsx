'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname } from '../../i18n/navigation';
import { getPageFromSearchParameters } from '../../utils/pokemonSearchParameters';

const getPageHref = (
  pathname: string,
  currentSearchParameters: URLSearchParams,
  page: number
): string => {
  const nextSearchParameters = new URLSearchParams(currentSearchParameters);
  nextSearchParameters.set('page', String(page));

  return `${pathname}?${nextSearchParameters.toString()}`;
};

type PaginationProperties = {
  isLoading: boolean;
  totalPages: number;
};

function Pagination({ isLoading, totalPages }: PaginationProperties) {
  const t = useTranslations('Pagination');
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const currentSearchParameters = new URLSearchParams(
    searchParameters.toString()
  );
  const currentPage = getPageFromSearchParameters(currentSearchParameters);
  const isPreviousDisabled: boolean = isLoading || currentPage === 1;
  const isNextDisabled: boolean = isLoading || currentPage === totalPages;

  return (
    <nav className="pagination" aria-label={t('label')}>
      {isPreviousDisabled ? (
        <span className="pagination-link pagination-link-disabled">
          {t('previous')}
        </span>
      ) : (
        <Link
          className="pagination-link"
          href={getPageHref(pathname, currentSearchParameters, currentPage - 1)}
          scroll={false}
        >
          {t('previous')}
        </Link>
      )}
      <span className="pagination-current" aria-current="page">
        {t('page', { currentPage, totalPages })}
      </span>
      {isNextDisabled ? (
        <span className="pagination-link pagination-link-disabled">
          {t('next')}
        </span>
      ) : (
        <Link
          className="pagination-link"
          href={getPageHref(pathname, currentSearchParameters, currentPage + 1)}
          scroll={false}
        >
          {t('next')}
        </Link>
      )}
    </nav>
  );
}

export default Pagination;
