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

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const FIRST_PAGE_OFFSET = 0;
const PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 100000;

const normalizeSearchTerm = (searchTerm: string) => {
  return searchTerm.trim().toLowerCase();
};

const getCurrentPage = (page: number) => {
  return Math.max(page, 1);
};

const getPokemonListQueryParams = (
  normalizedSearchTerm: string,
  currentPage: number
) => {
  const offset = normalizedSearchTerm
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
) => {
  return pokemons.filter((pokemon) =>
    normalizedSearchTerm ? pokemon.name.includes(normalizedSearchTerm) : true
  );
};

const getPokemonPageItems = (
  pokemons: PokemonListItem[],
  normalizedSearchTerm: string,
  currentPage: number
) => {
  if (!normalizedSearchTerm) {
    return pokemons;
  }

  return pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
};

const getTotalPages = (totalItems: number) => {
  return Math.ceil(totalItems / PAGE_SIZE);
};

const formatDescription = (description: string) => {
  return description.replace(/\s+/g, ' ');
};

const fetchJson = async <ResponseBody>(
  url: string,
  errorMessage: string
): Promise<ResponseBody> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const data: ResponseBody = await response.json();

    return data;
  } catch {
    throw new Error(errorMessage);
  }
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
  const species = await fetchJson<PokemonSpeciesResponse>(
    `${API_BASE_URL}/pokemon-species/${speciesName}`,
    'Failed to load Pokemon description.'
  );
  const englishEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );

  return formatDescription(
    englishEntry?.flavor_text ?? 'No description for this Pokemon'
  );
};

const getPokemonByName = async (name: string): Promise<Pokemon> => {
  const pokemon = await fetchJson<PokemonDetailsResponse>(
    `${API_BASE_URL}/pokemon/${name}`,
    'Failed to load Pokemon.'
  );
  const description = await getPokemonDescription(pokemon.species.name);

  return normalizePokemon(pokemon, description);
};

const getPokemons = async (searchTerm = '', page = 1): Promise<PokemonPage> => {
  const normalizedSearchTerm = normalizeSearchTerm(searchTerm);
  const currentPage = getCurrentPage(page);
  const queryParams = getPokemonListQueryParams(
    normalizedSearchTerm,
    currentPage
  );

  const data = await fetchJson<PokemonListResponse>(
    `${API_BASE_URL}/pokemon?${queryParams}`,
    'Failed to load Pokemon list.'
  );
  const filteredResults = filterPokemonList(data.results, normalizedSearchTerm);
  const pageResults = getPokemonPageItems(
    filteredResults,
    normalizedSearchTerm,
    currentPage
  );
  const totalItems = normalizedSearchTerm ? filteredResults.length : data.count;
  const pokemons = await Promise.all(
    pageResults.map((pokemon) => getPokemonByName(pokemon.name))
  );

  return {
    pokemons,
    totalPages: getTotalPages(totalItems),
  };
};

const getPokemonById = async (
  id: string | number | null | undefined
): Promise<Pokemon> => {
  const pokemonId = parsePositiveInteger(String(id));

  if (pokemonId === null) {
    throw new Error('Invalid Pokemon id.');
  }

  const pokemon = await fetchJson<PokemonDetailsResponse>(
    `${API_BASE_URL}/pokemon/${pokemonId}`,
    'Failed to load Pokemon.'
  );
  const description = await getPokemonDescription(pokemon.species.name);

  return normalizePokemon(pokemon, description);
};

export const api = {
  getPokemonById,
  getPokemons,
};
