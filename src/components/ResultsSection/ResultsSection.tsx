import { useTranslations } from 'next-intl';
import type { PokemonPage } from '../../types';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import '../StatusMessage.css';
import Pagination from './Pagination';
import PokemonResultItem from './PokemonResultItem';
import ResultsRefreshButton from './client/ResultsRefreshButton';
import './ResultsSection.css';

type ResultsSectionProperties = {
  currentPage?: number;
  currentSearchParameters?: URLSearchParams;
  error?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  pokemonPage?: PokemonPage;
  selectedPokemonId?: number | null;
};

function ResultsSection({
  currentPage = 1,
  currentSearchParameters = new URLSearchParams(),
  error = false,
  isLoading = false,
  onRefresh,
  pokemonPage,
  selectedPokemonId = null,
}: ResultsSectionProperties) {
  const t = useTranslations('Results');
  const resolvedPokemonPage = pokemonPage ?? { pokemons: [], totalPages: 0 };
  const errorMessage = error ? t('error') : '';
  const { pokemons, totalPages } = resolvedPokemonPage;
  const showPagination: boolean = !errorMessage && totalPages > 1;
  const paginationPathname = selectedPokemonId
    ? `/details/${String(selectedPokemonId)}`
    : '/';

  return (
    <section className="results-section" aria-labelledby="results-title">
      <div>
        <h2 id="results-title">{t('title')}</h2>
        <p>{t('subtitle')}</p>
        <ResultsRefreshButton
          disabled={isLoading}
          label={t('refresh')}
          onRefresh={onRefresh}
        />
      </div>

      {isLoading && <LoadingIndicator />}
      {errorMessage && (
        <p className="status-message status-message-error">{errorMessage}</p>
      )}
      {!isLoading && !errorMessage && pokemons.length === 0 && (
        <p className="status-message">{t('noResults')}</p>
      )}

      <div className="result-list">
        {pokemons.map((pokemon) => (
          <PokemonResultItem
            key={pokemon.id}
            currentSearchParameters={currentSearchParameters}
            pokemon={pokemon}
            selectedPokemonId={selectedPokemonId}
          />
        ))}
      </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          currentSearchParameters={currentSearchParameters}
          isLoading={false}
          pathname={paginationPathname}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}

export default ResultsSection;
