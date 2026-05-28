import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiCacheTtlSeconds } from '../config/apiConfig';
import type { Pokemon, PokemonPage } from '../types';
import { getPokemonById, getPokemons } from './pokemonService';

type PokemonPageQueryArguments = {
  page: number;
  searchTerm: string;
};

type QueryError = {
  message: string;
};

const getQueryError = (message: string): QueryError => ({ message });

export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fakeBaseQuery<QueryError>(),
  keepUnusedDataFor: apiCacheTtlSeconds,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['PokemonList', 'PokemonDetails'],
  endpoints: (builder) => ({
    getPokemonById: builder.query<Pokemon, string | number>({
      queryFn: async (id) => {
        try {
          return { data: await getPokemonById(id) };
        } catch {
          return { error: getQueryError('Failed to load Pokemon data.') };
        }
      },
      providesTags: (result, _error, id) => [
        { type: 'PokemonDetails', id: result?.id ?? id },
      ],
    }),
    getPokemons: builder.query<PokemonPage, PokemonPageQueryArguments>({
      queryFn: async ({ page, searchTerm }) => {
        try {
          return { data: await getPokemons(searchTerm, page) };
        } catch {
          return { error: getQueryError('Failed to load data') };
        }
      },
      providesTags: () => {
        const listTag = { type: 'PokemonList' as const, id: 'LIST' };

        return [listTag];
      },
    }),
  }),
});

export const { useGetPokemonByIdQuery, useGetPokemonsQuery } = pokemonApi;
