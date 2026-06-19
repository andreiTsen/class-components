'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPokemonSelection } from '../../../store/selectedPokemonSlice';
import type { Pokemon } from '../../../types';

type SelectedPokemonCheckboxProperties = {
  ariaLabel: string;
  pokemon: Pokemon;
};

function SelectedPokemonCheckbox({
  ariaLabel,
  pokemon,
}: SelectedPokemonCheckboxProperties) {
  const dispatch = useAppDispatch();
  const selectedPokemonIds = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemonIds
  );
  const isChecked = selectedPokemonIds.includes(pokemon.id);

  return (
    <label
      className="result-checkbox"
      onClick={(event: MouseEvent<HTMLLabelElement>): void => {
        event.stopPropagation();
      }}
    >
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={isChecked}
        onChange={(event): void => {
          dispatch(
            setPokemonSelection({
              isSelected: event.target.checked,
              pokemon,
            })
          );
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>): void => {
          event.stopPropagation();
        }}
      />
    </label>
  );
}

export default SelectedPokemonCheckbox;
