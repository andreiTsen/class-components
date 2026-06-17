import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

const getPageHref = (pathname: string, page: number): string => {
  return `${pathname}?page=${String(page)}`;
};

type PaginationProperties = {
  currentPage: number;
  isLoading: boolean;
  totalPages: number;
};

function Pagination({
  currentPage,
  isLoading,
  totalPages,
}: PaginationProperties) {
  const pathname = usePathname();
  const t = useTranslations('Pagination');
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
          href={getPageHref(pathname, currentPage - 1)}
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
          href={getPageHref(pathname, currentPage + 1)}
        >
          {t('next')}
        </Link>
      )}
    </nav>
  );
}

export default Pagination;
