import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router';
import { useCallback, useEffect, useMemo, type KeyboardEvent } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorTestButton from '../components/ErrorTestButton';
import ResultsSection from '../components/ResultsSection';
import SearchSection from '../components/SearchSection';
import useLocalStorage from '../hooks/useLocalStorage';
import usePokemonSearch from '../hooks/usePokemonSearch';
import { parsePositiveInteger } from '../utils/numbers';
import PageLayout from './PageLayout';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

const getPageFromSearchParameters = (
  searchParameters: URLSearchParams
): number => {
  const page = parsePositiveInteger(searchParameters.get('page'));
  return page ?? 1;
};

type MasterDetailLayoutProperties = {
  currentPage: number;
  error: string;
  handleCloseDetails: () => void;
  handleMasterPaneKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  handlePokemonSelect: (pokemonId: number) => void;
  isLoading: boolean;
  pokemons: ReturnType<typeof usePokemonSearch>['pokemons'];
  selectedPokemonId: number | null;
  totalPages: number;
};

type SetSearchParameters = ReturnType<typeof useSearchParams>[1];

type HomePageHandlers = {
  handleCloseDetails: () => void;
  handleMasterPaneKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  handlePokemonSelect: (pokemonId: number) => void;
  handleSearch: (searchTerm: string) => void;
};

type UseHomePageHandlersParameters = {
  currentPage: number;
  searchParameters: URLSearchParams;
  setSearchParameters: SetSearchParameters;
  setStoredSearchTerm: (searchTerm: string) => void;
};

const useHomePageHandlers = ({
  currentPage,
  searchParameters,
  setSearchParameters,
  setStoredSearchTerm,
}: UseHomePageHandlersParameters): HomePageHandlers => {
  const navigate = useNavigate();
  const searchWithCurrentPage = useMemo(() => {
    const nextSearchParameters = new URLSearchParams(searchParameters);
    nextSearchParameters.set('page', String(currentPage));
    return `?${nextSearchParameters.toString()}`;
  }, [currentPage, searchParameters]);
  const handleSearch = useCallback(
    (searchTerm: string) => {
      setStoredSearchTerm(searchTerm);
      setSearchParameters((currentSearchParameters) => {
        const nextSearchParameters = new URLSearchParams(
          currentSearchParameters
        );
        nextSearchParameters.set('page', '1');
        return nextSearchParameters;
      });
    },
    [setSearchParameters, setStoredSearchTerm]
  );
  const handlePokemonSelect = useCallback(
    (pokemonId: number) => {
      void navigate({
        pathname: `/details/${String(pokemonId)}`,
        search: searchWithCurrentPage,
      });
    },
    [navigate, searchWithCurrentPage]
  );
  const handleCloseDetails = useCallback(() => {
    void navigate({ pathname: '/', search: searchWithCurrentPage });
  }, [navigate, searchWithCurrentPage]);
  const handleMasterPaneKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCloseDetails();
      }
    },
    [handleCloseDetails]
  );

  return {
    handleCloseDetails,
    handleMasterPaneKeyDown,
    handlePokemonSelect,
    handleSearch,
  };
};

type UsePokemonPageLoadingParameters = {
  loadPage: (page: number, searchTerm: string) => Promise<void>;
  searchParameters: URLSearchParams;
  setSearchParameters: SetSearchParameters;
  storedSearchTerm: string;
};

const usePokemonPageLoading = ({
  loadPage,
  searchParameters,
  setSearchParameters,
  storedSearchTerm,
}: UsePokemonPageLoadingParameters): void => {
  useEffect(() => {
    const nextPage = getPageFromSearchParameters(searchParameters);

    if (searchParameters.get('page') !== String(nextPage)) {
      setSearchParameters(
        (currentSearchParameters) => {
          const nextSearchParameters = new URLSearchParams(
            currentSearchParameters
          );
          nextSearchParameters.set('page', String(nextPage));
          return nextSearchParameters;
        },
        { replace: true }
      );
      return;
    }

    void loadPage(nextPage, storedSearchTerm);
  }, [loadPage, searchParameters, setSearchParameters, storedSearchTerm]);
};

function MasterDetailLayout({
  currentPage,
  error,
  handleCloseDetails,
  handleMasterPaneKeyDown,
  handlePokemonSelect,
  isLoading,
  pokemons,
  selectedPokemonId,
  totalPages,
}: MasterDetailLayoutProperties) {
  return (
    <div className="master-detail-layout">
      <div
        className="master-pane"
        role={selectedPokemonId ? 'button' : undefined}
        tabIndex={selectedPokemonId ? 0 : undefined}
        aria-label={selectedPokemonId ? 'Close Pokemon details' : undefined}
        onClick={selectedPokemonId ? handleCloseDetails : undefined}
        onKeyDown={selectedPokemonId ? handleMasterPaneKeyDown : undefined}
      >
        <ResultsSection
          currentPage={currentPage}
          error={error}
          isLoading={isLoading}
          onPokemonSelect={handlePokemonSelect}
          pokemons={pokemons}
          selectedPokemonId={selectedPokemonId}
          totalPages={totalPages}
        />
      </div>
      {selectedPokemonId && (
        <Outlet context={{ onClose: handleCloseDetails }} />
      )}
    </div>
  );
}

function HomePage() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const { currentPage, error, isLoading, loadPage, pokemons, totalPages } =
    usePokemonSearch();
  const detailsMatch = useMatch('/details/:pokemonId');
  const selectedPokemonId = parsePositiveInteger(
    detailsMatch?.params.pokemonId
  );
  const handlers = useHomePageHandlers({
    currentPage,
    searchParameters,
    setSearchParameters,
    setStoredSearchTerm,
  });

  usePokemonPageLoading({
    loadPage,
    searchParameters,
    setSearchParameters,
    storedSearchTerm,
  });

  return (
    <PageLayout>
      <ErrorBoundary>
        <main className="application-page">
          <SearchSection
            initialSearchTerm={storedSearchTerm}
            onSearch={handlers.handleSearch}
          />
          <MasterDetailLayout
            currentPage={currentPage}
            error={error}
            handleCloseDetails={handlers.handleCloseDetails}
            handleMasterPaneKeyDown={handlers.handleMasterPaneKeyDown}
            handlePokemonSelect={handlers.handlePokemonSelect}
            isLoading={isLoading}
            pokemons={pokemons}
            selectedPokemonId={selectedPokemonId}
            totalPages={totalPages}
          />
          <ErrorTestButton />
        </main>
      </ErrorBoundary>
    </PageLayout>
  );
}

export default HomePage;
