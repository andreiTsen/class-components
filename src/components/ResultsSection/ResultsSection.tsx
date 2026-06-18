import { useSearchParams } from 'react-router';
import { useGetPokemonsQuery } from '../../services/pokemonApi';
import type { Pokemon } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';
import {
  getPageFromSearchParameters,
  getSearchTermFromSearchParameters,
} from '../../utils/pokemonSearchParameters';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import '../StatusMessage.css';
import Pagination from './Pagination';
import PokemonResultItem from './PokemonResultItem';
import './ResultsSection.css';

const EMPTY_POKEMONS: Pokemon[] = [];
const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

function ResultsSection() {
  const [searchParameters] = useSearchParams();
  const [storedSearchTerm] = useLocalStorage(SEARCH_TERM_STORAGE_KEY);
  const currentPage = getPageFromSearchParameters(searchParameters);
  const searchTerm = getSearchTermFromSearchParameters(
    searchParameters,
    storedSearchTerm
  );
  const { data, isError, isLoading, refetch } = useGetPokemonsQuery(
    {
      page: currentPage,
      searchTerm: searchTerm.trim(),
    },
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const error = isError ? 'Failed to load data' : '';
  const pokemons = data?.pokemons ?? EMPTY_POKEMONS;
  const totalPages = data?.totalPages ?? 0;
  const showPagination: boolean = !error && totalPages > 1;
  const handleRefresh = (): void => {
    void refetch();
  };

  return (
    <section className="results-section" aria-labelledby="results-title">
      <div>
        <h2 id="results-title">Pokemon Results</h2>
        <p>Submitted Pokemon</p>
        <button type="button" onClick={handleRefresh} disabled={isLoading}>
          Refresh results
        </button>
      </div>

      {isLoading && <LoadingIndicator />}
      {error && <p className="status-message status-message-error">{error}</p>}
      {!isLoading && !error && pokemons.length === 0 && (
        <p className="status-message">No pokemons found.</p>
      )}

      <div className="result-list">
        {pokemons.map((pokemon) => (
          <PokemonResultItem key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          isLoading={isLoading}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}

export default ResultsSection;
