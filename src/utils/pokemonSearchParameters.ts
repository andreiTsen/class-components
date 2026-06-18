import { parsePositiveInteger } from './parsePositiveInteger';

const DEFAULT_PAGE = 1;
const PAGE_SEARCH_PARAMETER = 'page';
const SEARCH_TERM_SEARCH_PARAMETER = 'search';

export const getPageFromSearchParameters = (
  searchParameters: URLSearchParams
): number => {
  return (
    parsePositiveInteger(searchParameters.get(PAGE_SEARCH_PARAMETER)) ??
    DEFAULT_PAGE
  );
};

export const getSearchTermFromSearchParameters = (
  searchParameters: URLSearchParams,
  fallbackSearchTerm = ''
): string => {
  return (
    searchParameters.get(SEARCH_TERM_SEARCH_PARAMETER) ?? fallbackSearchTerm
  );
};

export const getSearchParametersWithSearchTerm = (
  currentSearchParameters: URLSearchParams,
  searchTerm: string
): URLSearchParams => {
  const nextSearchParameters = new URLSearchParams(currentSearchParameters);
  nextSearchParameters.set(PAGE_SEARCH_PARAMETER, String(DEFAULT_PAGE));

  if (searchTerm) {
    nextSearchParameters.set(SEARCH_TERM_SEARCH_PARAMETER, searchTerm);
  } else {
    nextSearchParameters.delete(SEARCH_TERM_SEARCH_PARAMETER);
  }

  return nextSearchParameters;
};

export const getNormalizedSearchParameters = (
  currentSearchParameters: URLSearchParams
): URLSearchParams | undefined => {
  const currentPage = getPageFromSearchParameters(currentSearchParameters);
  const nextSearchParameters = new URLSearchParams(currentSearchParameters);
  nextSearchParameters.set(PAGE_SEARCH_PARAMETER, String(currentPage));

  return nextSearchParameters.toString() === currentSearchParameters.toString()
    ? undefined
    : nextSearchParameters;
};
