import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorTestButton from './components/ErrorTestButton';
import DetailsSkeletonPanel from './components/DetailsSkeletonPanel';
import useLocalStorage from './hooks/useLocalStorage';
import { api, type Pokemon } from './services/api';
import './App.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

const getPageFromSearchParams = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get('page'));

  return Number.isInteger(page) && page > 0 ? page : 1;
};

function App() {
  const { getItem, setItem } = useLocalStorage();
  const detailsMatch = useMatch('/details/:pokemonId');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialSearchTerm] = useState(
    () => getItem(SEARCH_TERM_STORAGE_KEY) ?? ''
  );
  const activeSearchTermRef = useRef(initialSearchTerm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const lastRequestRef = useRef<{ page: number; searchTerm: string } | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(() =>
    getPageFromSearchParams(searchParams)
  );
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const selectedPokemonId = detailsMatch?.params.pokemonId
    ? Number(detailsMatch.params.pokemonId)
    : null;

  const updatePageInUrl = useCallback(
    (page: number, replace = false) => {
      setSearchParams(
        (currentSearchParams) => {
          const nextSearchParams = new URLSearchParams(currentSearchParams);

          nextSearchParams.set('page', String(page));
          return nextSearchParams;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const requestPokemons = useCallback(
    async (normalizedSearchTerm: string, page: number) => {
      const currentPage = Math.max(page, 1);

      try {
        const pokemonPage = await api.getPokemons(
          normalizedSearchTerm,
          currentPage
        );

        if (
          pokemonPage.totalPages > 0 &&
          currentPage > pokemonPage.totalPages
        ) {
          const lastPage = pokemonPage.totalPages;
          const lastPageData = await api.getPokemons(
            normalizedSearchTerm,
            lastPage
          );

          setCurrentPage(lastPage);
          updatePageInUrl(lastPage, true);
          lastRequestRef.current = {
            page: lastPage,
            searchTerm: normalizedSearchTerm,
          };
          setPokemons(lastPageData.pokemons);
          setTotalPages(lastPageData.totalPages);
          return;
        }

        lastRequestRef.current = {
          page: currentPage,
          searchTerm: normalizedSearchTerm,
        };
        setPokemons(pokemonPage.pokemons);
        setTotalPages(pokemonPage.totalPages);
      } catch {
        setError(
          'Failed to load data. Check the request and try again.'
        );
        setPokemons([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    [updatePageInUrl]
  );

  const loadPage = useCallback(
    async (
      page: number,
      searchTerm = activeSearchTermRef.current,
      replaceUrl = false
    ) => {
      const nextPage = Math.max(page, 1);
      const normalizedSearchTerm = searchTerm.trim();

      if (
        lastRequestRef.current?.searchTerm === normalizedSearchTerm &&
        lastRequestRef.current.page === nextPage
      ) {
        return;
      }

      activeSearchTermRef.current = normalizedSearchTerm;
      setItem(SEARCH_TERM_STORAGE_KEY, normalizedSearchTerm);
      setError('');
      setIsLoading(true);
      setCurrentPage(nextPage);
      updatePageInUrl(nextPage, replaceUrl);

      await requestPokemons(normalizedSearchTerm, nextPage);
    },
    [requestPokemons, setItem, updatePageInUrl]
  );

  const loadPokemons = useCallback(
    async (searchTerm = '') => {
      const normalizedSearchTerm = searchTerm.trim();

      if (
        lastRequestRef.current?.searchTerm === normalizedSearchTerm &&
        lastRequestRef.current.page === 1
      ) {
        return;
      }

      await loadPage(1, normalizedSearchTerm);
    },
    [loadPage]
  );

  const getSearchWithCurrentPage = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set('page', String(currentPage));
    return `?${nextSearchParams.toString()}`;
  }, [currentPage, searchParams]);

  const handlePokemonSelect = useCallback(
    (pokemonId: number) => {
      navigate({
        pathname: `/details/${pokemonId}`,
        search: getSearchWithCurrentPage(),
      });
    },
    [getSearchWithCurrentPage, navigate]
  );

  const handleCloseDetails = useCallback(() => {
    navigate({
      pathname: '/',
      search: getSearchWithCurrentPage(),
    });
  }, [getSearchWithCurrentPage, navigate]);

  useEffect(() => {
    const initialPage = getPageFromSearchParams(searchParams);

    updatePageInUrl(initialPage, true);
    void loadPage(initialPage, activeSearchTermRef.current, true);
  }, [loadPage, searchParams, updatePageInUrl]);

  return (
    <div className="page">
      <Header />
      <ErrorBoundary>
        <main className="application-page">
          <SearchSection onSearch={loadPokemons} />
          <div className="master-detail-layout">
            <div
              className="master-pane"
              onClick={selectedPokemonId ? handleCloseDetails : undefined}
            >
              <ResultsSection
                currentPage={currentPage}
                error={error}
                isLoading={isLoading}
                onPageChange={loadPage}
                onPokemonSelect={handlePokemonSelect}
                pokemons={pokemons}
                selectedPokemonId={selectedPokemonId}
                totalPages={totalPages}
              />
            </div>
            {selectedPokemonId ? (
              <Outlet context={{ onClose: handleCloseDetails }} />
            ) : (
              <DetailsSkeletonPanel />
            )}
          </div>
          <ErrorTestButton />
        </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;
