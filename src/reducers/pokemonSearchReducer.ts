import type { Pokemon, PokemonPage } from '../types';

export type PokemonSearchState = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  pokemons: Pokemon[];
  totalPages: number;
};

export type PokemonSearchAction =
  | { page: number; type: 'loading' }
  | { page: number; pokemonPage: PokemonPage; type: 'success' }
  | { type: 'error' };

export const initialPokemonSearchState: PokemonSearchState = {
  currentPage: 1,
  error: '',
  isLoading: false,
  pokemons: [],
  totalPages: 0,
};

export const pokemonSearchReducer = (
  state: PokemonSearchState,
  action: PokemonSearchAction
): PokemonSearchState => {
  switch (action.type) {
    case 'loading': {
      return {
        ...state,
        currentPage: action.page,
        error: '',
        isLoading: true,
      };
    }
    case 'success': {
      return {
        currentPage: action.page,
        error: '',
        isLoading: false,
        pokemons: action.pokemonPage.pokemons,
        totalPages: action.pokemonPage.totalPages,
      };
    }
    case 'error': {
      return {
        ...state,
        error: 'Failed to load data',
        isLoading: false,
        pokemons: [],
        totalPages: 0,
      };
    }
  }
};
