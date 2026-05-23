import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { useCallback, useEffect, useMemo, type KeyboardEvent } from 'react';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import useLocalStorage from '../hooks/useLocalStorage';
import usePokemonSearch from '../hooks/usePokemonSearch';
import { parseParameter } from '../utils/parameters';
import PageLayout from '../components/PageLayout/PageLayout';
import './HomePage.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

const getPageFromSearchParameters = (
  searchParameters: URLSearchParams
): number => {
  const page: number | null = parseParameter(searchParameters.get('page'));
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
  const navigate: NavigateFunction = useNavigate();
  const searchWithCurrentPage: string = useMemo((): string => {
    const nextSearchParameters: URLSearchParams = new URLSearchParams(
      searchParameters
    );
    nextSearchParameters.set('page', String(currentPage));
    return `?${nextSearchParameters.toString()}`;
  }, [currentPage, searchParameters]);
  const handleSearch: HomePageHandlers['handleSearch'] = useCallback(
    (searchTerm: string): void => {
      setStoredSearchTerm(searchTerm);
      setSearchParameters((currentSearchParameters) => {
        const nextSearchParameters: URLSearchParams = new URLSearchParams(
          currentSearchParameters
        );
        nextSearchParameters.set('page', '1');
        return nextSearchParameters;
      });
    },
    [setSearchParameters, setStoredSearchTerm]
  );
  const handlePokemonSelect: HomePageHandlers['handlePokemonSelect'] =
    useCallback(
      (pokemonId: number): void => {
        void navigate({
          pathname: `/details/${String(pokemonId)}`,
          search: searchWithCurrentPage,
        });
      },
      [navigate, searchWithCurrentPage]
    );
  const handleCloseDetails: HomePageHandlers['handleCloseDetails'] =
    useCallback((): void => {
      void navigate({ pathname: '/', search: searchWithCurrentPage });
    }, [navigate, searchWithCurrentPage]);
  const handleMasterPaneKeyDown: HomePageHandlers['handleMasterPaneKeyDown'] =
    useCallback(
      (event: KeyboardEvent<HTMLDivElement>): void => {
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
    const nextPage: number = getPageFromSearchParameters(searchParameters);

    if (searchParameters.get('page') !== String(nextPage)) {
      setSearchParameters(
        (currentSearchParameters) => {
          const nextSearchParameters: URLSearchParams = new URLSearchParams(
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
  const {
    currentPage,
    error,
    isLoading,
    loadPage,
    pokemons,
    totalPages,
  }: ReturnType<typeof usePokemonSearch> = usePokemonSearch();
  const detailsMatch: ReturnType<typeof useMatch> = useMatch(
    '/details/:pokemonId'
  );
  const selectedPokemonId: number | null = parseParameter(
    detailsMatch?.params.pokemonId
  );
  const handlers: HomePageHandlers = useHomePageHandlers({
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
    </PageLayout>
  );
}

export default HomePage;
