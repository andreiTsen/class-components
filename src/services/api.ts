import type {
  Pokemon,
  PokemonDetailsResponse,
  PokemonListItem,
  PokemonListResponse,
  PokemonPage,
  PokemonSpeciesResponse,
} from './apiTypes';
import { parsePositiveInteger } from '../utils/numbers';

export type { Pokemon, PokemonPage } from './apiTypes';

type PokemonFlavorTextEntry =
  PokemonSpeciesResponse['flavor_text_entries'][number];

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const FIRST_PAGE_OFFSET = 0;
const PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 100_000;

const normalizeSearchTerm = (searchTerm: string): string => {
  return searchTerm.trim().toLowerCase();
};

const getCurrentPage = (page: number): number => {
  return Math.max(page, 1);
};

const getPokemonListQueryParameters = (
  normalizedSearchTerm: string,
  currentPage: number
): URLSearchParams => {
  const offset: number = normalizedSearchTerm
    ? FIRST_PAGE_OFFSET
    : (currentPage - 1) * PAGE_SIZE;

  return new URLSearchParams({
    limit: String(normalizedSearchTerm ? SEARCH_RESULTS_LIMIT : PAGE_SIZE),
    offset: String(offset),
  });
};

const filterPokemonList = (
  pokemons: PokemonListItem[],
  normalizedSearchTerm: string
): PokemonListItem[] => {
  return pokemons.filter((pokemon) =>
    normalizedSearchTerm ? pokemon.name.includes(normalizedSearchTerm) : true
  );
};

const getPokemonPageItems = (
  pokemons: PokemonListItem[],
  normalizedSearchTerm: string,
  currentPage: number
): PokemonListItem[] => {
  if (!normalizedSearchTerm) {
    return pokemons;
  }

  return pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
};

const getTotalPages = (totalItems: number): number => {
  return Math.ceil(totalItems / PAGE_SIZE);
};

const formatDescription = (description: string): string => {
  return description.replaceAll(/\s+/g, ' ');
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isNamedResource = (value: unknown): value is { name: string } => {
  return isRecord(value) && typeof value.name === 'string';
};

const isPokemonListItem = (value: unknown): value is PokemonListItem => {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.url === 'string'
  );
};

const isPokemonListResponse = (
  value: unknown
): value is PokemonListResponse => {
  return (
    isRecord(value) &&
    typeof value.count === 'number' &&
    Array.isArray(value.results) &&
    value.results.every(isPokemonListItem)
  );
};

const isPokemonDetailsResponse = (
  value: unknown
): value is PokemonDetailsResponse => {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    isNamedResource(value.species) &&
    isRecord(value.sprites) &&
    (typeof value.sprites.front_default === 'string' ||
      value.sprites.front_default === null)
  );
};

const isPokemonSpeciesResponse = (
  value: unknown
): value is PokemonSpeciesResponse => {
  return (
    isRecord(value) &&
    Array.isArray(value.flavor_text_entries) &&
    value.flavor_text_entries.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.flavor_text === 'string' &&
        isNamedResource(entry.language)
    )
  );
};

const fetchJson = async (
  url: string,
  errorMessage: string
): Promise<unknown> => {
  try {
    const response: Response = await fetch(url);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const data: unknown = await response.json();

    return data;
  } catch {
    throw new Error(errorMessage);
  }
};

const fetchPokemonListResponse = async (
  url: string
): Promise<PokemonListResponse> => {
  const data: unknown = await fetchJson(url, 'Failed to load Pokemon list.');

  if (!isPokemonListResponse(data)) {
    throw new Error('Failed to load Pokemon list.');
  }

  return data;
};

const fetchPokemonDetailsResponse = async (
  url: string
): Promise<PokemonDetailsResponse> => {
  const data: unknown = await fetchJson(url, 'Failed to load Pokemon.');

  if (!isPokemonDetailsResponse(data)) {
    throw new Error('Failed to load Pokemon.');
  }

  return data;
};

const fetchPokemonSpeciesResponse = async (
  url: string
): Promise<PokemonSpeciesResponse> => {
  const data: unknown = await fetchJson(
    url,
    'Failed to load Pokemon description.'
  );

  if (!isPokemonSpeciesResponse(data)) {
    throw new Error('Failed to load Pokemon description.');
  }

  return data;
};

const normalizePokemon = (
  pokemon: PokemonDetailsResponse,
  description: string
): Pokemon => ({
  description,
  id: pokemon.id,
  name: pokemon.name,
  imageUrl: pokemon.sprites.front_default ?? '',
});

const getPokemonDescription = async (speciesName: string): Promise<string> => {
  const species: PokemonSpeciesResponse = await fetchPokemonSpeciesResponse(
    `${API_BASE_URL}/pokemon-species/${speciesName}`
  );
  const englishEntry: PokemonFlavorTextEntry | undefined =
    species.flavor_text_entries.find((entry) => entry.language.name === 'en');

  return formatDescription(
    englishEntry?.flavor_text ?? 'No description for this Pokemon'
  );
};

const getPokemonByName = async (name: string): Promise<Pokemon> => {
  const pokemon: PokemonDetailsResponse = await fetchPokemonDetailsResponse(
    `${API_BASE_URL}/pokemon/${name}`
  );
  const description: string = await getPokemonDescription(pokemon.species.name);

  return normalizePokemon(pokemon, description);
};

const getPokemons = async (searchTerm = '', page = 1): Promise<PokemonPage> => {
  const normalizedSearchTerm: string = normalizeSearchTerm(searchTerm);
  const currentPage: number = getCurrentPage(page);
  const queryParameters: URLSearchParams = getPokemonListQueryParameters(
    normalizedSearchTerm,
    currentPage
  );

  const data: PokemonListResponse = await fetchPokemonListResponse(
    `${API_BASE_URL}/pokemon?${queryParameters}`
  );
  const filteredResults: PokemonListItem[] = filterPokemonList(
    data.results,
    normalizedSearchTerm
  );
  const pageResults: PokemonListItem[] = getPokemonPageItems(
    filteredResults,
    normalizedSearchTerm,
    currentPage
  );
  const totalItems: number = normalizedSearchTerm
    ? filteredResults.length
    : data.count;
  const pokemons: Pokemon[] = await Promise.all(
    pageResults.map((pokemon) => getPokemonByName(pokemon.name))
  );

  return {
    pokemons,
    totalPages: getTotalPages(totalItems),
  };
};

const getPokemonById = async (id: string | number): Promise<Pokemon> => {
  const pokemonId: number | null = parsePositiveInteger(String(id));

  if (pokemonId === null) {
    throw new Error('Invalid Pokemon id.');
  }

  const pokemon: PokemonDetailsResponse = await fetchPokemonDetailsResponse(
    `${API_BASE_URL}/pokemon/${String(pokemonId)}`
  );
  const description: string = await getPokemonDescription(pokemon.species.name);

  return normalizePokemon(pokemon, description);
};

export const api = {
  getPokemonById,
  getPokemons,
};
