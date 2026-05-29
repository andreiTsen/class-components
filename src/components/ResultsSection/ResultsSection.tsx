import { useMemo } from 'react';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import type { Pokemon } from '../../types';
import Pagination from './Pagination';
import PokemonResultItem from './PokemonResultItem';
import { ResultsSectionContext } from './ResultsSectionContext';
import '../StatusMessage.css';
import './ResultsSection.css';

type ResultsSectionProperties = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  onPokemonSelectionChange: (pokemon: Pokemon, isSelected: boolean) => void;
  onPokemonSelect: (pokemonId: number) => void;
  pokemons: Pokemon[];
  selectedPokemonId?: number | null;
  selectedPokemonIds?: number[];
  totalPages: number;
};

function ResultsSection({
  currentPage,
  error,
  isLoading,
  onPokemonSelectionChange,
  onPokemonSelect,
  pokemons,
  selectedPokemonId = null,
  selectedPokemonIds = [],
  totalPages,
}: ResultsSectionProperties) {
  const showPagination: boolean = !error && totalPages > 1;
  const resultsSectionContextValue = useMemo(
    () => ({
      onPokemonSelectionChange,
      onPokemonSelect,
      selectedPokemonId,
      selectedPokemonIds,
    }),
    [
      onPokemonSelectionChange,
      onPokemonSelect,
      selectedPokemonId,
      selectedPokemonIds,
    ]
  );

  return (
    <section className="results-section" aria-labelledby="results-title">
      <div>
        <h2 id="results-title">Pokemon Results</h2>
        <p>Submitted Pokemon</p>
      </div>

      {isLoading && <LoadingIndicator />}
      {error && <p className="status-message status-message-error">{error}</p>}
      {!isLoading && !error && pokemons.length === 0 && (
        <p className="status-message">No pokemons found.</p>
      )}

      <ResultsSectionContext.Provider value={resultsSectionContextValue}>
        <div className="result-list">
          {pokemons.map((pokemon) => (
            <PokemonResultItem key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      </ResultsSectionContext.Provider>

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
