'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import useLocalStorage from '../../hooks/useLocalStorage';
import { usePathname, useRouter } from '../../i18n/navigation';
import {
  getNormalizedSearchParameters,
  getSearchParametersWithSearchTerm,
  getSearchTermFromSearchParameters,
} from '../../utils/pokemonSearchParameters';
import SearchSection from './SearchSection';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

type SearchSectionControllerProperties = {
  initialSearchTerm: string;
};

function SearchSectionController({
  initialSearchTerm,
}: SearchSectionControllerProperties) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const search = searchParameters.toString();
  const currentSearchParameters = useMemo(
    () => new URLSearchParams(search),
    [search]
  );
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const currentSearchTerm = getSearchTermFromSearchParameters(
    currentSearchParameters,
    storedSearchTerm || initialSearchTerm
  );

  useEffect(() => {
    const normalizedSearchParameters = getNormalizedSearchParameters(
      currentSearchParameters
    );

    if (!normalizedSearchParameters) {
      return;
    }

    router.replace(`${pathname}?${normalizedSearchParameters.toString()}`);
  }, [currentSearchParameters, pathname, router]);

  const handleSearch = useCallback(
    (searchTerm: string): void => {
      const nextSearchParameters = getSearchParametersWithSearchTerm(
        currentSearchParameters,
        searchTerm
      );

      router.push(`${pathname}?${nextSearchParameters.toString()}`);
      setStoredSearchTerm(searchTerm);
    },
    [currentSearchParameters, pathname, router, setStoredSearchTerm]
  );

  return (
    <SearchSection
      handleSearch={handleSearch}
      storedSearchTerm={currentSearchTerm}
    />
  );
}

export default SearchSectionController;
