import type { KeyboardEvent, MouseEvent } from 'react';
import { useMatch, useNavigate, useSearchParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPokemonSelection } from '../../store/selectedPokemonSlice';
import type { Pokemon } from '../../types';
import { parsePositiveInteger } from '../../utils/parsePositiveInteger';

type PokemonResultItemProperties = {
  pokemon: Pokemon;
};

function PokemonResultItem({ pokemon }: PokemonResultItemProperties) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();
  const selectedPokemonId = parsePositiveInteger(
    useMatch('/details/:pokemonId')?.params.pokemonId
  );
  const selectedPokemonIds = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemonIds
  );
  const isChecked = selectedPokemonIds.includes(pokemon.id);
  const isSelected = selectedPokemonId === pokemon.id;

  const openPokemonDetails = (): void => {
    void navigate({
      pathname: `/details/${String(pokemon.id)}`,
      search: `?${searchParameters.toString()}`,
    });
  };

  return (
    <article
      className="result-item"
      tabIndex={0}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={pokemon.name}
      onClick={(event: MouseEvent<HTMLElement>): void => {
        event.stopPropagation();
        openPokemonDetails();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLElement>): void => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPokemonDetails();
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
            dispatch(
              setPokemonSelection({
                isSelected: event.target.checked,
                pokemon,
              })
            );
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
