import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

export const pokemonBaseQuery = fetchBaseQuery({ baseUrl: API_BASE_URL });

export type FetchWithBaseQuery = (
  path: string
) => ReturnType<typeof pokemonBaseQuery>;
