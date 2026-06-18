import { Link, useSearchParams } from 'react-router';

const getPageSearch = (
  currentSearchParameters: URLSearchParams,
  page: number
): string => {
  const nextSearchParameters = new URLSearchParams(currentSearchParameters);
  nextSearchParameters.set('page', String(page));

  return `?${nextSearchParameters.toString()}`;
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
  const [searchParameters] = useSearchParams();
  const isPreviousDisabled: boolean = isLoading || currentPage === 1;
  const isNextDisabled: boolean = isLoading || currentPage === totalPages;

  return (
    <nav className="pagination" aria-label="Pagination">
      {isPreviousDisabled ? (
        <span className="pagination-link pagination-link-disabled">
          Previous
        </span>
      ) : (
        <Link
          className="pagination-link"
          to={{ search: getPageSearch(searchParameters, currentPage - 1) }}
        >
          Previous
        </Link>
      )}
      <span className="pagination-current" aria-current="page">
        Page {currentPage} of {totalPages}
      </span>
      {isNextDisabled ? (
        <span className="pagination-link pagination-link-disabled">Next</span>
      ) : (
        <Link
          className="pagination-link"
          to={{ search: getPageSearch(searchParameters, currentPage + 1) }}
        >
          Next
        </Link>
      )}
    </nav>
  );
}

export default Pagination;
