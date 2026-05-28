import { Link } from 'react-router';
import type { KeyboardEvent, MouseEvent } from 'react';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import type { Pokemon } from '../../types';
import '../StatusMessage.css';
import './ResultsSection.css';

const getPageSearch = (page: number): string => {
  return `?page=${String(page)}`;
};

type ResultsSectionProperties = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  onPokemonSelectionChange: (pokemon: Pokemon, isSelected: boolean) => void;
  onPokemonSelect: (pokemonId: number) => void;
  onRefresh: () => void;
  pokemons: Pokemon[];
  selectedPokemonId?: number | null;
  selectedPokemonIds?: number[];
  totalPages: number;
};

type PokemonResultItemProperties = {
  isSelected: boolean;
  isChecked: boolean;
  onPokemonSelectionChange: (pokemon: Pokemon, isSelected: boolean) => void;
  onPokemonSelect: (pokemonId: number) => void;
  pokemon: Pokemon;
};

function PokemonResultItem({
  isSelected,
  isChecked,
  onPokemonSelectionChange,
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
      onClick={(event: MouseEvent<HTMLElement>): void => {
        event.stopPropagation();
        handleSelect();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLElement>): void => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      <label
        className="result-checkbox"
        onClick={(event: MouseEvent<HTMLLabelElement>): void => {
          event.stopPropagation();
        }}
      >
        <input
          type="checkbox"
          aria-label={`Select ${pokemon.name}`}
          checked={isChecked}
          onChange={(event): void => {
            onPokemonSelectionChange(pokemon, event.target.checked);
          }}
          onKeyDown={(event): void => {
            event.stopPropagation();
          }}
        />
      </label>
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
  const isPreviousDisabled: boolean = isLoading || currentPage === 1;
  const isNextDisabled: boolean = isLoading || currentPage === totalPages;

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
  onPokemonSelectionChange,
  onPokemonSelect,
  onRefresh,
  pokemons,
  selectedPokemonId = null,
  selectedPokemonIds = [],
  totalPages,
}: ResultsSectionProperties) {
  const showPagination: boolean = !error && totalPages > 1;

  return (
    <section className="results-section" aria-labelledby="results-title">
      <div>
        <h2 id="results-title">Pokemons Results</h2>
        <p>Submitted Pokemon</p>
        <button type="button" onClick={onRefresh} disabled={isLoading}>
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
