import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import type { Pokemon } from '../../types';
import Pagination from './Pagination';
import PokemonResultItem from './PokemonResultItem';
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

      <div className="result-list">
        {pokemons.map((pokemon) => (
          <PokemonResultItem
            isChecked={selectedPokemonIds.includes(pokemon.id)}
            isSelected={selectedPokemonId === pokemon.id}
            key={pokemon.id}
            onPokemonSelectionChange={onPokemonSelectionChange}
            onPokemonSelect={onPokemonSelect}
            pokemon={pokemon}
          />
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
