import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Pokemon } from '../services/api';

type SelectedPokemonState = {
  error: string;
  isLoading: boolean;
  pokemon: Pokemon | null;
  selectedPokemonId: number | null;
};

const initialState: SelectedPokemonState = {
  error: '',
  isLoading: false,
  pokemon: null,
  selectedPokemonId: null,
};

const selectedPokemonSlice = createSlice({
  name: 'selectedPokemon',
  initialState,
  reducers: {
    clearSelectedPokemon: () => initialState,
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
  },
});

export const {
  clearSelectedPokemon,
  loadSelectedPokemonFailure,
  loadSelectedPokemonStart,
  loadSelectedPokemonSuccess,
  selectPokemon,
} = selectedPokemonSlice.actions;

export default selectedPokemonSlice.reducer;
