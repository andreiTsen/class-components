import { Link } from 'react-router';
import LoadingIndicator from './LoadingIndicator';
import type { Pokemon } from '../services/api';

const getPageSearch = (page: number): string => {
  return `?page=${String(page)}`;
};

type ResultsSectionProperties = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  onPokemonSelect: (pokemonId: number) => void;
  pokemons: Pokemon[];
  selectedPokemonId?: number | null;
  totalPages: number;
};

type PokemonResultItemProperties = {
  isSelected: boolean;
  onPokemonSelect: (pokemonId: number) => void;
  pokemon: Pokemon;
};

function PokemonResultItem({
  isSelected,
  onPokemonSelect,
  pokemon,
}: PokemonResultItemProperties) {
  const handleSelect = (): void => {
    onPokemonSelect(pokemon.id);
  };

  return (
    <article
      className="result-item"
      tabIndex={0}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={pokemon.name}
      onClick={(event) => {
        event.stopPropagation();
        handleSelect();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      <div className="pokemon-info">
        {pokemon.imageUrl && <img src={pokemon.imageUrl} alt={pokemon.name} />}
        <div>
          <h3>{pokemon.name}</h3>
          <p>{pokemon.description}</p>
        </div>
      </div>
      <strong>#{pokemon.id}</strong>
    </article>
  );
}

type PaginationProperties = {
  currentPage: number;
  isLoading: boolean;
  totalPages: number;
};

function Pagination({
  currentPage,
  isLoading,
  totalPages,
}: PaginationProperties) {
  const isPreviousDisabled = isLoading || currentPage === 1;
  const isNextDisabled = isLoading || currentPage === totalPages;

  return (
    <nav className="pagination" aria-label="Pagination">
      {isPreviousDisabled ? (
        <span className="pagination-link pagination-link-disabled">
          Previous
        </span>
      ) : (
        <Link
          className="pagination-link"
          to={{ search: getPageSearch(currentPage - 1) }}
        >
          Previous
        </Link>
      )}
      <span className="pagination-current" aria-current="page">
        Page {currentPage} of {totalPages}
      </span>
      {isNextDisabled ? (
        <span className="pagination-link pagination-link-disabled">Next</span>
      ) : (
        <Link
          className="pagination-link"
          to={{ search: getPageSearch(currentPage + 1) }}
        >
          Next
        </Link>
      )}
    </nav>
  );
}

function ResultsSection({
  currentPage,
  error,
  isLoading,
  onPokemonSelect,
  pokemons,
  selectedPokemonId = null,
  totalPages,
}: ResultsSectionProperties) {
  const showPagination = !error && totalPages > 1;

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
          <PokemonResultItem
            isSelected={selectedPokemonId === pokemon.id}
            key={pokemon.id}
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
