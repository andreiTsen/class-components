import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { apiCacheTtlSeconds } from '../config/apiConfig';
import type {
  Pokemon,
  PokemonDetailsResponse,
  PokemonListItem,
  PokemonListResponse,
  PokemonPage,
  PokemonSpeciesResponse,
} from '../types';
import { parsePositiveInteger } from '../utils/parsePositiveInteger';
import {
  isPokemonDetailsResponse,
  isPokemonListResponse,
  isPokemonSpeciesResponse,
} from '../utils/typeGuards';
import { mapPokemonDetailsToPokemon } from './mapPokemonDetailsToPokemon';

type PokemonPageQueryArguments = {
  page: number;
  searchTerm: string;
};

type QueryError = FetchBaseQueryError;
type TypeGuard<T> = (value: unknown) => value is T;
type PokemonPageRequest = {
  currentPage: number;
  limit: number;
  offset: number;
  searchTerm: string;
};

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const FIRST_PAGE_OFFSET = 0;
const PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 100_000;
const NO_DESCRIPTION = 'No description for this Pokemon';
const pokemonBaseQuery = fetchBaseQuery({ baseUrl: API_BASE_URL });
type FetchWithBaseQuery = (path: string) => ReturnType<typeof pokemonBaseQuery>;

const getQueryError = (message: string): QueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

const getValidatedQueryData = async <T>(
  fetchWithBaseQuery: FetchWithBaseQuery,
  path: string,
  isExpectedResponse: TypeGuard<T>,
  errorMessage: string
): Promise<T | QueryError> => {
  const response = await fetchWithBaseQuery(path);

  if (response.error || !isExpectedResponse(response.data)) {
    return getQueryError(errorMessage);
  }

  return response.data;
};

const isQueryError = (value: unknown): value is QueryError => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'error' in value
  );
};

const getPokemonDescription = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  speciesName: string
): Promise<string | QueryError> => {
  const species = await getValidatedQueryData<PokemonSpeciesResponse>(
    fetchWithBaseQuery,
    `pokemon-species/${speciesName}`,
    isPokemonSpeciesResponse,
    'Failed to load Pokemon description.'
  );

  if (isQueryError(species)) {
    return species;
  }

  const englishEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );

  return englishEntry?.flavor_text ?? NO_DESCRIPTION;
};

const loadPokemon = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  nameOrId: string | number
): Promise<Pokemon | QueryError> => {
  const pokemon = await getValidatedQueryData<PokemonDetailsResponse>(
    fetchWithBaseQuery,
    `pokemon/${String(nameOrId)}`,
    isPokemonDetailsResponse,
    'Failed to load Pokemon.'
  );

  if (isQueryError(pokemon)) {
    return pokemon;
  }

  const rawDescription = await getPokemonDescription(
    fetchWithBaseQuery,
    pokemon.species.name
  );

  if (isQueryError(rawDescription)) {
    return rawDescription;
  }

  return mapPokemonDetailsToPokemon(
    pokemon,
    rawDescription.replaceAll(/\s+/g, ' ')
  );
};

const getPokemonPageRequest = (
  term: string,
  page: number
): PokemonPageRequest => {
  const searchTerm = term.trim().toLowerCase();
  const currentPage = Math.max(page, 1);

  return {
    currentPage,
    limit: searchTerm ? SEARCH_RESULTS_LIMIT : PAGE_SIZE,
    offset: searchTerm ? FIRST_PAGE_OFFSET : (currentPage - 1) * PAGE_SIZE,
    searchTerm,
  };
};

const getPagedPokemonList = (
  data: PokemonListResponse,
  { currentPage, searchTerm }: PokemonPageRequest
): { pageResults: PokemonListItem[]; totalItems: number } => {
  const filteredResults = data.results.filter((pokemon) =>
    searchTerm ? pokemon.name.includes(searchTerm) : true
  );
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
  const pageEndIndex = currentPage * PAGE_SIZE;

  return {
    pageResults: searchTerm
      ? filteredResults.slice(pageStartIndex, pageEndIndex)
      : filteredResults,
    totalItems: searchTerm ? filteredResults.length : data.count,
  };
};

const loadPokemonListItems = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  pageResults: PokemonListItem[]
): Promise<Pokemon[] | QueryError> => {
  const pokemons: Pokemon[] = [];

  for (const pokemonListItem of pageResults) {
    const pokemon = await loadPokemon(fetchWithBaseQuery, pokemonListItem.name);

    if (isQueryError(pokemon)) {
      return pokemon;
    }

    pokemons.push(pokemon);
  }

  return pokemons;
};

const loadPokemonPage = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  term = '',
  page = 1
): Promise<PokemonPage | QueryError> => {
  const pageRequest = getPokemonPageRequest(term, page);
  const queryParameters = new URLSearchParams({
    limit: String(pageRequest.limit),
    offset: String(pageRequest.offset),
  });
  const data = await getValidatedQueryData<PokemonListResponse>(
    fetchWithBaseQuery,
    `pokemon?${queryParameters}`,
    isPokemonListResponse,
    'Failed to load Pokemon list.'
  );

  if (isQueryError(data)) {
    return data;
  }

  const { pageResults, totalItems } = getPagedPokemonList(data, pageRequest);
  const pokemons = await loadPokemonListItems(fetchWithBaseQuery, pageResults);

  return isQueryError(pokemons)
    ? pokemons
    : { pokemons, totalPages: Math.ceil(totalItems / PAGE_SIZE) };
};

const loadPokemonById = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  id: string | number
): Promise<Pokemon | QueryError> => {
  const pokemonId = parsePositiveInteger(id);

  if (pokemonId === null) {
    return getQueryError('Invalid Pokemon id.');
  }

  return loadPokemon(fetchWithBaseQuery, pokemonId);
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
