import { useTranslations } from 'next-intl';
import type { PokemonPage } from '../../types';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import '../StatusMessage.css';
import Pagination from './Pagination';
import PokemonResultItem from './PokemonResultItem';
import ResultsRefreshButton from './client/ResultsRefreshButton';
import './ResultsSection.css';

type ResultsSectionProperties = {
  error?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  pokemonPage?: PokemonPage;
};

function ResultsSection({
  error = false,
  isLoading = false,
  onRefresh,
  pokemonPage,
}: ResultsSectionProperties) {
  const t = useTranslations('Results');
  const resolvedPokemonPage = pokemonPage ?? { pokemons: [], totalPages: 0 };
  const errorMessage = error ? t('error') : '';
  const { pokemons, totalPages } = resolvedPokemonPage;
  const showPagination: boolean = !errorMessage && totalPages > 1;

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
          <PokemonResultItem key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>

      {showPagination && (
        <Pagination isLoading={false} totalPages={totalPages} />
      )}
    </section>
  );
}

export default ResultsSection;
