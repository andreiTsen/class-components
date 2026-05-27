import { useCallback, useEffect, useMemo, type KeyboardEvent } from 'react';
import { Outlet, useMatch, useNavigate, useSearchParams } from 'react-router';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Layout from '../components/Layout/Layout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import SelectedPokemonActions from '../components/SelectedPokemonActions/SelectedPokemonActions';
import useLocalStorage from '../hooks/useLocalStorage';
import { useGetPokemonsQuery } from '../services/pokemonApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearSelectedPokemon,
  selectPokemon,
  setPokemonSelection,
  unselectAllPokemons,
} from '../store/selectedPokemonSlice';
import type { AppDispatch } from '../store/store';
import type { Pokemon } from '../types';
import { parsePositiveInteger } from '../utils/parsePositiveInteger';
import './Home.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';
const EMPTY_POKEMONS: Pokemon[] = [];
type SetSearchParameters = ReturnType<typeof useSearchParams>[1];

type HomeHandlers = {
  handleClearSelectedPokemons: () => void;
  handleCloseDetails: () => void;
  handleDownloadSelectedPokemons: () => void;
  handleMasterPaneKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  handlePokemonSelect: (pokemonId: number) => void;
  handlePokemonSelectionChange: (pokemon: Pokemon, isSelected: boolean) => void;
  handleSearch: (searchTerm: string) => void;
};

type ResultsWithDetailsProperties = {
  currentPage: number;
  error: string;
  handlers: HomeHandlers;
  isLoading: boolean;
  pokemons: Pokemon[];
  selectedPokemonId: number | null;
  selectedPokemonIds: number[];
  totalPages: number;
};

const getPageFromSearchParameters = (
  searchParameters: URLSearchParams
): number => {
  return parsePositiveInteger(searchParameters.get('page')) ?? 1;
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

const usePageParameterNormalization = (
  searchParameters: URLSearchParams,
  setSearchParameters: SetSearchParameters
): void => {
  useEffect(() => {
    const nextPage = getPageFromSearchParameters(searchParameters);

    if (searchParameters.get('page') === String(nextPage)) {
      return;
    }

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
  }, [searchParameters, setSearchParameters]);
};

const useSelectedPokemonSynchronization = (
  dispatch: AppDispatch,
  selectedPokemonId: number | null,
  storedSelectedPokemonId: number | null
): void => {
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
};

const downloadSelectedPokemons = (selectedPokemons: Pokemon[]): void => {
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

type UseHomeHandlersProperties = {
  currentPage: number;
  dispatch: AppDispatch;
  searchParameters: URLSearchParams;
  selectedPokemons: Pokemon[];
  setSearchParameters: SetSearchParameters;
  setStoredSearchTerm: (searchTerm: string) => void;
  storedSelectedPokemonId: number | null;
};

const useHomeHandlers = ({
  currentPage,
  dispatch,
  searchParameters,
  selectedPokemons,
  setSearchParameters,
  setStoredSearchTerm,
  storedSelectedPokemonId,
}: UseHomeHandlersProperties): HomeHandlers => {
  const navigate = useNavigate();
  const searchWithCurrentPage = useMemo((): string => {
    const nextSearchParameters = new URLSearchParams(searchParameters);
    nextSearchParameters.set('page', String(currentPage));
    return `?${nextSearchParameters.toString()}`;
  }, [currentPage, searchParameters]);

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

  return {
    handleClearSelectedPokemons: (): void => {
      dispatch(unselectAllPokemons());
    },
    handleCloseDetails,
    handleDownloadSelectedPokemons: (): void => {
      downloadSelectedPokemons(selectedPokemons);
    },
    handleMasterPaneKeyDown,
    handlePokemonSelect,
    handlePokemonSelectionChange: (pokemon, isSelected): void => {
      dispatch(setPokemonSelection({ isSelected, pokemon }));
    },
    handleSearch,
  };
};

function ResultsWithDetails({
  currentPage,
  error,
  handlers,
  isLoading,
  pokemons,
  selectedPokemonId,
  selectedPokemonIds,
  totalPages,
}: ResultsWithDetailsProperties) {
  return (
    <div className="master-detail-layout">
      <div
        className="master-pane"
        role={selectedPokemonId ? 'button' : undefined}
        tabIndex={selectedPokemonId ? 0 : undefined}
        aria-label={selectedPokemonId ? 'Close Pokemon details' : undefined}
        onClick={selectedPokemonId ? handlers.handleCloseDetails : undefined}
        onKeyDown={
          selectedPokemonId ? handlers.handleMasterPaneKeyDown : undefined
        }
      >
        <ResultsSection
          currentPage={currentPage}
          error={error}
          isLoading={isLoading}
          onPokemonSelectionChange={handlers.handlePokemonSelectionChange}
          onPokemonSelect={handlers.handlePokemonSelect}
          pokemons={pokemons}
          selectedPokemonId={selectedPokemonId}
          selectedPokemonIds={selectedPokemonIds}
          totalPages={totalPages}
        />
      </div>
      {selectedPokemonId && (
        <Outlet context={{ onClose: handlers.handleCloseDetails }} />
      )}
    </div>
  );
}

function Home() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const dispatch = useAppDispatch();
  const selectedPokemonIds = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemonIds
  );
  const selectedPokemons = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemons
  );
  const storedSelectedPokemonId = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemonId
  );
  const currentPage = getPageFromSearchParameters(searchParameters);
  const { data, isError, isFetching } = useGetPokemonsQuery({
    page: currentPage,
    searchTerm: storedSearchTerm.trim(),
  });
  const error = isError ? 'Failed to load data' : '';
  const pokemons = data?.pokemons ?? EMPTY_POKEMONS;
  const totalPages = data?.totalPages ?? 0;
  const selectedPokemonId = parsePositiveInteger(
    useMatch('/details/:pokemonId')?.params.pokemonId
  );
  const handlers = useHomeHandlers({
    currentPage,
    dispatch,
    searchParameters,
    selectedPokemons,
    setSearchParameters,
    setStoredSearchTerm,
    storedSelectedPokemonId,
  });

  usePageParameterNormalization(searchParameters, setSearchParameters);
  useSelectedPokemonSynchronization(
    dispatch,
    selectedPokemonId,
    storedSelectedPokemonId
  );

  return (
    <Layout>
      <main className="application-page">
        <SearchSection
          initialSearchTerm={storedSearchTerm}
          onSearch={handlers.handleSearch}
        />
        <ResultsWithDetails
          currentPage={currentPage}
          error={error}
          handlers={handlers}
          isLoading={isFetching}
          pokemons={pokemons}
          selectedPokemonId={selectedPokemonId}
          selectedPokemonIds={selectedPokemonIds}
          totalPages={totalPages}
        />
        <ErrorTestButton />
        <SelectedPokemonActions
          onClearAll={handlers.handleClearSelectedPokemons}
          onDownload={handlers.handleDownloadSelectedPokemons}
          selectedPokemons={selectedPokemons}
        />
      </main>
    </Layout>
  );
}

export default Home;
