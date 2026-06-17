import { createApi } from '@reduxjs/toolkit/query/react';
import { apiCacheTtlSeconds } from '../config/apiConfig';
import type { Pokemon, PokemonPage } from '../types';
import { pokemonBaseQuery } from './pokemonBaseQuery';
import { loadPokemonById, loadPokemonPage } from './pokemonLoaders';
import { getQueryError, isQueryError } from './queryHelpers';

type PokemonPageQueryArguments = {
  page: number;
  searchTerm: string;
};

export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: pokemonBaseQuery,
  keepUnusedDataFor: apiCacheTtlSeconds,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['PokemonList', 'PokemonDetails'],
  endpoints: (builder) => ({
    getPokemonById: builder.query<Pokemon, string | number>({
      queryFn: async (id, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        const pokemon = await loadPokemonById(fetchWithBaseQuery, id);

        return isQueryError(pokemon)
          ? { error: getQueryError('Failed to load Pokemon data.') }
          : { data: pokemon };
      },
      providesTags: (result, _error, id) => [
        { type: 'PokemonDetails', id: result?.id ?? id },
      ],
    }),
    getPokemons: builder.query<PokemonPage, PokemonPageQueryArguments>({
      queryFn: async (
        { page, searchTerm },
        _queryApi,
        _extraOptions,
        fetchWithBaseQuery
      ) => {
        const pokemonPage = await loadPokemonPage(
          fetchWithBaseQuery,
          searchTerm,
          page
        );

        return isQueryError(pokemonPage)
          ? { error: getQueryError('Failed to load data') }
          : { data: pokemonPage };
      },
      providesTags: () => {
        const listTag = { type: 'PokemonList' as const, id: 'LIST' };

        return [listTag];
      },
    }),
  }),
});

export const { useGetPokemonByIdQuery, useGetPokemonsQuery } = pokemonApi;
