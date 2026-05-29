import type { KeyboardEvent, MouseEvent } from 'react';
import type { Pokemon } from '../../types';

type PokemonResultItemProperties = {
  isChecked: boolean;
  isSelected: boolean;
  onPokemonSelectionChange: (pokemon: Pokemon, isSelected: boolean) => void;
  onPokemonSelect: (pokemonId: number) => void;
  pokemon: Pokemon;
};

function PokemonResultItem({
  isChecked,
  isSelected,
  onPokemonSelectionChange,
  onPokemonSelect,
  pokemon,
}: PokemonResultItemProperties) {
  return (
    <article
      className="result-item"
      tabIndex={0}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={pokemon.name}
      onClick={(event: MouseEvent<HTMLElement>): void => {
        event.stopPropagation();
        onPokemonSelect(pokemon.id);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLElement>): void => {
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

export default PokemonResultItem;
