import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Pokemon } from '../types';

type SelectedPokemonState = {
  selectedPokemons: Pokemon[];
  selectedPokemonIds: number[];
  selectedPokemonId: number | null;
};

const initialState: SelectedPokemonState = {
  selectedPokemons: [],
  selectedPokemonIds: [],
  selectedPokemonId: null,
};

const selectedPokemonSlice = createSlice({
  name: 'selectedPokemon',
  initialState,
  reducers: {
    clearSelectedPokemon: (state) => {
      state.selectedPokemonId = null;
    },
    selectPokemon: (state, action: PayloadAction<number>) => {
      state.selectedPokemonId = action.payload;
    },
    setPokemonSelection: (
      state,
      action: PayloadAction<{ isSelected: boolean; pokemon: Pokemon }>
    ) => {
      const { isSelected, pokemon } = action.payload;

      if (isSelected && !state.selectedPokemonIds.includes(pokemon.id)) {
        state.selectedPokemonIds.push(pokemon.id);
        state.selectedPokemons.push(pokemon);
      }

      if (!isSelected) {
        state.selectedPokemonIds = state.selectedPokemonIds.filter(
          (selectedPokemonId) => selectedPokemonId !== pokemon.id
        );
        state.selectedPokemons = state.selectedPokemons.filter(
          (selectedPokemon) => selectedPokemon.id !== pokemon.id
        );
      }
    },
    unselectAllPokemons: (state) => {
      state.selectedPokemonIds = [];
      state.selectedPokemons = [];
    },
  },
});

export const {
  clearSelectedPokemon,
  selectPokemon,
  setPokemonSelection,
  unselectAllPokemons,
} = selectedPokemonSlice.actions;

export default selectedPokemonSlice.reducer;
