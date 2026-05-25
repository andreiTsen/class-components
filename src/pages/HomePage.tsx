import { useCallback, useEffect, useMemo, type KeyboardEvent } from 'react';
import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import PageLayout from '../components/PageLayout/PageLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import SelectedPokemonActions from '../components/SelectedPokemonActions/SelectedPokemonActions';
import useLocalStorage from '../hooks/useLocalStorage';
import usePokemonSearch from '../hooks/usePokemonSearch';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearSelectedPokemon,
  selectPokemon,
  setPokemonSelection,
  unselectAllPokemons,
} from '../store/selectedPokemonSlice';
import type { Pokemon } from '../types';
import { parseParameter } from '../utils/parameters';
import './HomePage.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

const getPageFromSearchParameters = (
  searchParameters: URLSearchParams
): number => {
  return parseParameter(searchParameters.get('page')) ?? 1;
};

const escapeCsvValue = (value: string | number): string => {
  const stringValue = String(value);

  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replaceAll('"', '""')}"`;
};

const getSelectedPokemonsCsv = (selectedPokemons: Pokemon[]): string => {
  const header = ['id', 'name', 'description', 'imageUrl', 'detailsUrl'];
  const rows = selectedPokemons.map((pokemon) => [
    pokemon.id,
    pokemon.name,
    pokemon.description,
    pokemon.imageUrl,
    `${globalThis.location.origin}/details/${String(pokemon.id)}`,
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');
};

function HomePage() {
  const [searchParameters, setSearchParameters] = useSearchParams();
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
  const { currentPage, error, isLoading, loadPage, pokemons, totalPages } =
    usePokemonSearch();
  const detailsMatch = useMatch('/details/:pokemonId');
  const selectedPokemonId = parseParameter(detailsMatch?.params.pokemonId);
  const navigate = useNavigate();
  const searchWithCurrentPage = useMemo((): string => {
    const nextSearchParameters = new URLSearchParams(searchParameters);
    nextSearchParameters.set('page', String(currentPage));
    return `?${nextSearchParameters.toString()}`;
  }, [currentPage, searchParameters]);

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

  const handleSearch = useCallback(
    (searchTerm: string): void => {
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
    (pokemonId: number): void => {
      if (storedSelectedPokemonId !== pokemonId) {
        dispatch(selectPokemon(pokemonId));
      }

      void navigate({
        pathname: `/details/${String(pokemonId)}`,
        search: searchWithCurrentPage,
      });
    },
    [dispatch, navigate, searchWithCurrentPage, storedSelectedPokemonId]
  );

  const handleCloseDetails = useCallback((): void => {
    dispatch(clearSelectedPokemon());
    void navigate({ pathname: '/', search: searchWithCurrentPage });
  }, [dispatch, navigate, searchWithCurrentPage]);

  const handleMasterPaneKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCloseDetails();
      }
    },
    [handleCloseDetails]
  );

  const handleDownloadSelectedPokemons = (): void => {
    const blob = new Blob([getSelectedPokemonsCsv(selectedPokemons)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${String(selectedPokemons.length)}_items.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout>
      <main className="application-page">
        <SearchSection
          initialSearchTerm={storedSearchTerm}
          onSearch={handleSearch}
        />
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
              onPokemonSelectionChange={(pokemon, isSelected): void => {
                dispatch(setPokemonSelection({ isSelected, pokemon }));
              }}
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
          onClearAll={(): void => {
            dispatch(unselectAllPokemons());
          }}
          onDownload={handleDownloadSelectedPokemons}
          selectedPokemons={selectedPokemons}
        />
      </main>
    </PageLayout>
  );
}

export default HomePage;
