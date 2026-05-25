export type Pokemon = {
  description: string;
  id: number;
  imageUrl: string;
  name: string;
};

export type PokemonPage = {
  pokemons: Pokemon[];
  totalPages: number;
};

export type UsePokemonSearchResult = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  loadPage: (page: number, searchTerm: string) => Promise<void>;
  pokemons: Pokemon[];
  totalPages: number;
};

export type PokemonListItem = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  results: PokemonListItem[];
};

export type PokemonDetailsResponse = {
  id: number;
  name: string;
  species: {
    name: string;
  };
  sprites: {
    front_default: string | null;
  };
};

export type PokemonSpeciesResponse = {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
};
