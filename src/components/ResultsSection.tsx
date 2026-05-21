import { Link } from 'react-router';
import LoadingIndicator from './LoadingIndicator';
import type { Pokemon } from '../services/api';

type ResultsSectionProps = {
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
}: ResultsSectionProps) {
  const showPagination = !error && totalPages > 1;
  const isPreviousDisabled = isLoading || currentPage === 1;
  const isNextDisabled = isLoading || currentPage === totalPages;

  return (
    <section className="results-section" aria-labelledby="results-title">
      <div>
        <h2 id="results-title">Pokemons Results</h2>
        <p>Submitted Pokemon</p>
      </div>

      {isLoading && <LoadingIndicator />}
      {error && <p className="status-message status-message-error">{error}</p>}
      {!isLoading && !error && pokemons.length === 0 && (
        <p className="status-message">No pokemons found.</p>
      )}

      <div className="result-list">
        {pokemons.map((pokemon) => (
          <article
            className="result-item"
            key={pokemon.id}
            tabIndex={0}
            aria-current={selectedPokemonId === pokemon.id ? 'true' : undefined}
            aria-label={pokemon.name}
            onClick={(event) => {
              event.stopPropagation();
              onPokemonSelect(pokemon.id);
            }}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onPokemonSelect(pokemon.id);
              }
            }}
          >
            <label
              className="result-checkbox"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <input
                type="checkbox"
                aria-label={`Select ${pokemon.name}`}
                checked={selectedPokemonIds.includes(pokemon.id)}
                onChange={(event) => {
                  onPokemonSelectionChange(pokemon, event.target.checked);
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
              />
            </label>
            <div className="pokemon-info">
              {pokemon.imageUrl && (
                <img src={pokemon.imageUrl} alt={pokemon.name} />
              )}
              <div>
                <h3>{pokemon.name}</h3>
                <p>{pokemon.description}</p>
              </div>
            </div>
            <strong>#{pokemon.id}</strong>
          </article>
        ))}
      </div>

      {showPagination && (
        <nav className="pagination" aria-label="Pagination">
          {isPreviousDisabled ? (
            <span className="pagination-link pagination-link-disabled">
              Previous
            </span>
          ) : (
            <Link
              className="pagination-link"
              to={{ search: `?page=${currentPage - 1}` }}
            >
              Previous
            </Link>
          )}
          <span className="pagination-current" aria-current="page">
            Page {currentPage} of {totalPages}
          </span>
          {isNextDisabled ? (
            <span className="pagination-link pagination-link-disabled">
              Next
            </span>
          ) : (
            <Link
              className="pagination-link"
              to={{ search: `?page=${currentPage + 1}` }}
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}

export default ResultsSection;
