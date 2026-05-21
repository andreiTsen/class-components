import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Pokemon } from '../services/api';

type SelectedPokemonState = {
  error: string;
  isLoading: boolean;
  pokemon: Pokemon | null;
  selectedPokemonIds: number[];
  selectedPokemonId: number | null;
};

const initialState: SelectedPokemonState = {
  error: '',
  isLoading: false,
  pokemon: null,
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
      action: PayloadAction<{ isSelected: boolean; pokemonId: number }>
    ) => {
      const { isSelected, pokemonId } = action.payload;

      if (isSelected && !state.selectedPokemonIds.includes(pokemonId)) {
        state.selectedPokemonIds.push(pokemonId);
      }

      if (!isSelected) {
        state.selectedPokemonIds = state.selectedPokemonIds.filter(
          (selectedPokemonId) => selectedPokemonId !== pokemonId
        );
      }
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
} = selectedPokemonSlice.actions;

export default selectedPokemonSlice.reducer;
