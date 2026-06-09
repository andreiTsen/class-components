import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { parsePositiveInteger } from '../utils/parsePositiveInteger';

type UseHomeSynchronizationProperties = {
  loadPage: (page: number, searchTerm: string) => Promise<void>;
  storedSearchTerm: string;
};

const useHomeSynchronization = ({
  loadPage,
  storedSearchTerm,
}: UseHomeSynchronizationProperties): void => {
  const [searchParameters, setSearchParameters] = useSearchParams();

  useEffect(() => {
    const currentPageFromUrl =
      parsePositiveInteger(searchParameters.get('page')) ?? 1;

    if (searchParameters.get('page') !== String(currentPageFromUrl)) {
      setSearchParameters(
        (currentSearchParameters) => {
          const nextSearchParameters = new URLSearchParams(
            currentSearchParameters
          );
          nextSearchParameters.set('page', String(currentPageFromUrl));
          return nextSearchParameters;
        },
        { replace: true }
      );
      return;
    }

    void loadPage(currentPageFromUrl, storedSearchTerm);
  }, [loadPage, searchParameters, setSearchParameters, storedSearchTerm]);
};

export default useHomeSynchronization;
