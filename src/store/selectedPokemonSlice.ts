import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Pokemon } from '../types';

type SelectedPokemonState = {
  error: string;
  isLoading: boolean;
  pokemon: Pokemon | null;
  selectedPokemons: Pokemon[];
  selectedPokemonIds: number[];
  selectedPokemonId: number | null;
};

const initialState: SelectedPokemonState = {
  error: '',
  isLoading: false,
  pokemon: null,
  selectedPokemons: [],
  selectedPokemonIds: [],
  selectedPokemonId: null,
};

const selectedPokemonSlice = createSlice({
  name: 'selectedPokemon',
  initialState,
  reducers: {
    clearSelectedPokemon: (state) => {
      state.error = '';
      state.isLoading = false;
      state.pokemon = null;
      state.selectedPokemonId = null;
    },
    loadSelectedPokemonFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.pokemon = null;
    },
    loadSelectedPokemonStart: (state) => {
      state.error = '';
      state.isLoading = true;
      state.pokemon = null;
    },
    loadSelectedPokemonSuccess: (state, action: PayloadAction<Pokemon>) => {
      state.error = '';
      state.isLoading = false;
      state.pokemon = action.payload;
    },
    selectPokemon: (state, action: PayloadAction<number>) => {
      state.error = '';
      state.isLoading = false;
      state.pokemon = null;
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
  loadSelectedPokemonFailure,
  loadSelectedPokemonStart,
  loadSelectedPokemonSuccess,
  selectPokemon,
  setPokemonSelection,
  unselectAllPokemons,
} = selectedPokemonSlice.actions;

export default selectedPokemonSlice.reducer;
