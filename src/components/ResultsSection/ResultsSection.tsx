import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
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
  const t = useTranslations('Results');
  const searchParameters = useSearchParams();
  const currentSearchParameters = new URLSearchParams(
    searchParameters.toString()
  );
  const [storedSearchTerm] = useLocalStorage(SEARCH_TERM_STORAGE_KEY);
  const currentPage = getPageFromSearchParameters(currentSearchParameters);
  const searchTerm = getSearchTermFromSearchParameters(
    currentSearchParameters,
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
  const error = isError ? t('error') : '';
  const pokemons = data?.pokemons ?? EMPTY_POKEMONS;
  const totalPages = data?.totalPages ?? 0;
  const showPagination: boolean = !error && totalPages > 1;

  const handleRefresh = (): void => {
    void refetch();
  };

  return (
    <section className="results-section" aria-labelledby="results-title">
      <div>
        <h2 id="results-title">{t('title')}</h2>
        <p>{t('subtitle')}</p>
        <button type="button" onClick={handleRefresh} disabled={isLoading}>
          {t('refresh')}
        </button>
      </div>

      {isLoading && <LoadingIndicator />}
      {error && <p className="status-message status-message-error">{error}</p>}
      {!isLoading && !error && pokemons.length === 0 && (
        <p className="status-message">{t('noResults')}</p>
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
