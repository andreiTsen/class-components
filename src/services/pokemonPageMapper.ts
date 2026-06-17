import type {
  PokemonListItem,
  PokemonListResponse,
  PokemonPage,
} from '../types';

const FIRST_PAGE_OFFSET = 0;
export const PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 100_000;

type PokemonPageRequest = {
  currentPage: number;
  limit: number;
  offset: number;
  searchTerm: string;
};

export const getPokemonPageRequest = (
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

export const getPagedPokemonList = (
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

export const getPokemonPage = (
  pokemons: PokemonPage['pokemons'],
  totalItems: number
): PokemonPage => ({
  pokemons,
  totalPages: Math.ceil(totalItems / PAGE_SIZE),
});
