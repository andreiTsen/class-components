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
  tagTypes: ['Pokemon'],
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
        { type: 'Pokemon', id: result?.id ?? id },
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
      providesTags: (result) => {
        const listTag = { type: 'Pokemon' as const, id: 'LIST' };

        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          ...result.pokemons.map((pokemon) => ({
            type: 'Pokemon' as const,
            id: pokemon.id,
          })),
        ];
      },
    }),
  }),
});

export const { useGetPokemonByIdQuery, useGetPokemonsQuery } = pokemonApi;
