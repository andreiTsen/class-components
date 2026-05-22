import type {
  Pokemon,
  PokemonDetailsResponse,
  PokemonListItem,
  PokemonListResponse,
  PokemonPage,
  PokemonSpeciesResponse,
} from '../types';
import { parseParameter } from '../utils/parameters';
import {
  isPokemonListResponse,
  isPokemonDetailsResponse,
  isPokemonSpeciesResponse,
} from '../utils/validators';
import { normalizePokemon } from './mappers';

type PokemonFlavorTextEntry =
  PokemonSpeciesResponse['flavor_text_entries'][number];

const API_BASE_URL = 'https://pokeapi.co/api/v2';
const FIRST_PAGE_OFFSET = 0;
const PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 100_000;

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

const getPokemonDescription = async (speciesName: string): Promise<string> => {
  const species: PokemonSpeciesResponse = await fetchPokemonSpeciesResponse(
    `${API_BASE_URL}/pokemon-species/${speciesName}`
  );
  const englishEntry: PokemonFlavorTextEntry | undefined =
    species.flavor_text_entries.find((entry) => entry.language.name === 'en');

  return englishEntry?.flavor_text ?? 'No description for this Pokemon';
};

const getPokemonByName = async (name: string): Promise<Pokemon> => {
  const pokemon: PokemonDetailsResponse = await fetchPokemonDetailsResponse(
    `${API_BASE_URL}/pokemon/${name}`
  );
  const rawDescription = await getPokemonDescription(pokemon.species.name);
  const description = rawDescription.replaceAll(/\s+/g, ' ');

  return normalizePokemon(pokemon, description);
};

const getPokemons = async (term = '', page = 1): Promise<PokemonPage> => {
  const searchTerm: string = term.trim().toLowerCase();
  const currentPage: number = Math.max(page, 1);
  const offset: number = searchTerm
    ? FIRST_PAGE_OFFSET
    : (currentPage - 1) * PAGE_SIZE;
  const queryParameters: URLSearchParams = new URLSearchParams({
    limit: String(searchTerm ? SEARCH_RESULTS_LIMIT : PAGE_SIZE),
    offset: String(offset),
  });

  const data: PokemonListResponse = await fetchPokemonListResponse(
    `${API_BASE_URL}/pokemon?${queryParameters}`
  );
  const filteredResults: PokemonListItem[] = data.results.filter((pokemon) =>
    searchTerm ? pokemon.name.includes(searchTerm) : true
  );
  const pageStartIndex: number = (currentPage - 1) * PAGE_SIZE;
  const pageEndIndex: number = currentPage * PAGE_SIZE;
  const pageResults: PokemonListItem[] = searchTerm
    ? filteredResults.slice(pageStartIndex, pageEndIndex)
    : filteredResults;
  const totalItems: number = searchTerm ? filteredResults.length : data.count;
  const pokemons: Pokemon[] = await Promise.all(
    pageResults.map((pokemon) => getPokemonByName(pokemon.name))
  );

  return {
    pokemons,
    totalPages: Math.ceil(totalItems / PAGE_SIZE),
  };
};

const getPokemonById = async (id: string | number): Promise<Pokemon> => {
  const pokemonId: number | null = parseParameter(id);

  if (pokemonId === null) {
    throw new Error('Invalid Pokemon id.');
  }

  const pokemon: PokemonDetailsResponse = await fetchPokemonDetailsResponse(
    `${API_BASE_URL}/pokemon/${String(pokemonId)}`
  );
  const rawDescription = await getPokemonDescription(pokemon.species.name);
  const description = rawDescription.replaceAll(/\s+/g, ' ');

  return normalizePokemon(pokemon, description);
};

export const api = {
  getPokemonById,
  getPokemons,
};
