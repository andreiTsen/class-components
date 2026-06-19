import type {
  Pokemon,
  PokemonDetailsResponse,
  PokemonListItem,
  PokemonListResponse,
  PokemonPage,
  PokemonSpeciesResponse,
} from '../types';
import {
  isPokemonDetailsResponse,
  isPokemonListResponse,
  isPokemonSpeciesResponse,
} from '../utils/typeGuards';
import { mapPokemonDetailsToPokemon } from './mapPokemonDetailsToPokemon';
import {
  getPagedPokemonList,
  getPokemonPageRequest,
  PAGE_SIZE,
} from './pokemonPageMapper';
import { getQueryError, isQueryError, type QueryError } from './queryHelpers';

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const NO_DESCRIPTION = 'No description for this Pokemon';

const fetchPokemonData = async <T>(
  path: string,
  isExpectedResponse: (value: unknown) => value is T,
  errorMessage: string
): Promise<T | QueryError> => {
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return getQueryError(errorMessage);
  }

  const data: unknown = await response.json();

  return isExpectedResponse(data) ? data : getQueryError(errorMessage);
};

const getPokemonDescription = async (
  speciesName: string
): Promise<string | QueryError> => {
  const species = await fetchPokemonData<PokemonSpeciesResponse>(
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
  nameOrId: string | number
): Promise<Pokemon | QueryError> => {
  const pokemon = await fetchPokemonData<PokemonDetailsResponse>(
    `pokemon/${String(nameOrId)}`,
    isPokemonDetailsResponse,
    'Failed to load Pokemon.'
  );

  if (isQueryError(pokemon)) {
    return pokemon;
  }

  const rawDescription = await getPokemonDescription(pokemon.species.name);

  if (isQueryError(rawDescription)) {
    return rawDescription;
  }

  return mapPokemonDetailsToPokemon(
    pokemon,
    rawDescription.replaceAll(/\s+/g, ' ')
  );
};

const loadPokemonListItems = async (
  pageResults: PokemonListItem[]
): Promise<Pokemon[] | QueryError> => {
  const pokemons: Pokemon[] = [];

  for (const pokemonListItem of pageResults) {
    const pokemon = await loadPokemon(pokemonListItem.name);

    if (isQueryError(pokemon)) {
      return pokemon;
    }

    pokemons.push(pokemon);
  }

  return pokemons;
};

export const loadPokemonPageOnServer = async (
  term = '',
  page = 1
): Promise<PokemonPage | QueryError> => {
  const pageRequest = getPokemonPageRequest(term, page);
  const queryParameters = new URLSearchParams({
    limit: String(pageRequest.limit),
    offset: String(pageRequest.offset),
  });
  const data = await fetchPokemonData<PokemonListResponse>(
    `pokemon?${queryParameters}`,
    isPokemonListResponse,
    'Failed to load Pokemon list.'
  );

  if (isQueryError(data)) {
    return data;
  }

  const { pageResults, totalItems } = getPagedPokemonList(data, pageRequest);
  const pokemons = await loadPokemonListItems(pageResults);

  return isQueryError(pokemons)
    ? pokemons
    : { pokemons, totalPages: Math.ceil(totalItems / PAGE_SIZE) };
};

export const loadPokemonByIdOnServer = async (
  id: string | number
): Promise<Pokemon | QueryError> => {
  return loadPokemon(id);
};
