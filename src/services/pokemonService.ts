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
  fetchPokemonDetails,
  fetchPokemonList,
  fetchPokemonSpecies,
} from './api';
import { mapPokemonDetailsToPokemon } from './mapPokemonDetailsToPokemon';

type PokemonFlavorTextEntry =
  PokemonSpeciesResponse['flavor_text_entries'][number];

const FIRST_PAGE_OFFSET = 0;
const PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 100_000;
const NO_DESCRIPTION = 'No description for this Pokemon';

const getPokemonDescription = async (speciesName: string): Promise<string> => {
  const species: PokemonSpeciesResponse =
    await fetchPokemonSpecies(speciesName);
  const englishEntry: PokemonFlavorTextEntry | undefined =
    species.flavor_text_entries.find((entry) => entry.language.name === 'en');

  return englishEntry?.flavor_text ?? NO_DESCRIPTION;
};

const loadPokemon = async (nameOrId: string | number): Promise<Pokemon> => {
  const pokemon: PokemonDetailsResponse = await fetchPokemonDetails(nameOrId);
  const rawDescription: string = await getPokemonDescription(
    pokemon.species.name
  );
  const description: string = rawDescription.replaceAll(/\s+/g, ' ');

  return mapPokemonDetailsToPokemon(pokemon, description);
};

export const getPokemons = async (
  term = '',
  page = 1
): Promise<PokemonPage> => {
  const searchTerm: string = term.trim().toLowerCase();
  const currentPage: number = Math.max(page, 1);
  const offset: number = searchTerm
    ? FIRST_PAGE_OFFSET
    : (currentPage - 1) * PAGE_SIZE;
  const limit: number = searchTerm ? SEARCH_RESULTS_LIMIT : PAGE_SIZE;
  const data: PokemonListResponse = await fetchPokemonList(limit, offset);
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
    pageResults.map((pokemon) => loadPokemon(pokemon.name))
  );

  return {
    pokemons,
    totalPages: Math.ceil(totalItems / PAGE_SIZE),
  };
};

export const getPokemonById = async (id: string | number): Promise<Pokemon> => {
  const pokemonId: number | null = parsePositiveInteger(id);

  if (pokemonId === null) {
    throw new Error('Invalid Pokemon id.');
  }

  return loadPokemon(pokemonId);
};
