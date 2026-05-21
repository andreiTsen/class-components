import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router';
import { useEffect, useRef } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorTestButton from '../components/ErrorTestButton';
import ResultsSection from '../components/ResultsSection';
import SearchSection from '../components/SearchSection';
import SelectedPokemonActions from '../components/SelectedPokemonActions';
import useLocalStorage from '../hooks/useLocalStorage';
import usePokemonSearch from '../hooks/usePokemonSearch';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearSelectedPokemon,
  selectPokemon,
  setPokemonSelection,
  unselectAllPokemons,
} from '../store/selectedPokemonSlice';
import type { Pokemon } from '../services/api';
import { parsePositiveInteger } from '../utils/numbers';
import PageLayout from './PageLayout';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

const getPageFromSearchParams = (searchParams: URLSearchParams) => {
  const page = parsePositiveInteger(searchParams.get('page'));
  return page ?? 1;
};

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const dispatch = useAppDispatch();
  const storedSelectedPokemonId = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemonId
  );
  const selectedPokemonIds = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemonIds
  );
  const selectedPokemons = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemons
  );
  const hasInitializedRef = useRef(false);
  const {
    currentPage,
    error,
    isLoading,
    loadPage,
    loadPokemons,
    pokemons,
    totalPages,
  } = usePokemonSearch();
  const detailsMatch = useMatch('/details/:pokemonId');
  const navigate = useNavigate();
  const selectedPokemonId = parsePositiveInteger(
    detailsMatch?.params.pokemonId
  );

  useEffect(() => {
    if (selectedPokemonId === null) {
      if (storedSelectedPokemonId !== null) {
        dispatch(clearSelectedPokemon());
      }
      return;
    }

    if (storedSelectedPokemonId !== selectedPokemonId) {
      dispatch(selectPokemon(selectedPokemonId));
    }
  }, [dispatch, selectedPokemonId, storedSelectedPokemonId]);

  const getSearchWithCurrentPage = () => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set('page', String(currentPage));
    return `?${nextSearchParams.toString()}`;
  };

  const handleSearch = async (searchTerm: string) => {
    setStoredSearchTerm(searchTerm);
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);
      nextSearchParams.set('page', '1');
      return nextSearchParams;
    });
    await loadPokemons(searchTerm);
  };

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const initialPage = getPageFromSearchParams(searchParams);
      setSearchParams(
        (currentSearchParams) => {
          const nextSearchParams = new URLSearchParams(currentSearchParams);
          nextSearchParams.set('page', String(initialPage));
          return nextSearchParams;
        },
        { replace: true }
      );
      void loadPage(initialPage, storedSearchTerm);
      return;
    }

    const nextPage = getPageFromSearchParams(searchParams);
    void loadPage(nextPage, storedSearchTerm);
  }, [loadPage, searchParams, setSearchParams, storedSearchTerm]);

  const handlePokemonSelect = (pokemonId: number) => {
    dispatch(selectPokemon(pokemonId));
    navigate({
      pathname: `/details/${pokemonId}`,
      search: getSearchWithCurrentPage(),
    });
  };

  const handlePokemonSelectionChange = (
    pokemon: Pokemon,
    isSelected: boolean
  ) => {
    dispatch(setPokemonSelection({ isSelected, pokemon }));
  };

  const handleClearSelectedPokemons = () => {
    dispatch(unselectAllPokemons());
  };

  const handleDownloadSelectedPokemons = () => {
    console.log('Selected Pokemon:', selectedPokemons);
  };

  const handleCloseDetails = () => {
    dispatch(clearSelectedPokemon());
    navigate({
      pathname: '/',
      search: getSearchWithCurrentPage(),
    });
  };

  return (
    <PageLayout>
      <ErrorBoundary>
        <main className="application-page">
          <SearchSection
            initialSearchTerm={storedSearchTerm}
            onSearch={handleSearch}
          />
          <div className="master-detail-layout">
            <div
              className="master-pane"
              onClick={selectedPokemonId ? handleCloseDetails : undefined}
            >
              <ResultsSection
                currentPage={currentPage}
                error={error}
                isLoading={isLoading}
                onPokemonSelectionChange={handlePokemonSelectionChange}
                onPokemonSelect={handlePokemonSelect}
                pokemons={pokemons}
                selectedPokemonId={selectedPokemonId}
                selectedPokemonIds={selectedPokemonIds}
                totalPages={totalPages}
              />
            </div>
            {selectedPokemonId && (
              <Outlet context={{ onClose: handleCloseDetails }} />
            )}
          </div>
          <ErrorTestButton />
          <SelectedPokemonActions
            onClearAll={handleClearSelectedPokemons}
            onDownload={handleDownloadSelectedPokemons}
            selectedPokemons={selectedPokemons}
          />
        </main>
      </ErrorBoundary>
    </PageLayout>
  );
}

export default HomePage;
