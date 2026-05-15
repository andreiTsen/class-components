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

type PokemonListResponse = {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
};

type PokemonDetailsResponse = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
};

type PokemonSpeciesResponse = {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
};

const FIRST_PAGE_OFFSET = 0;
const PAGE_SIZE = 10;

class Api {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
  }

  async getPokemons(searchTerm = '', page = 1): Promise<PokemonPage> {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const currentPage = Math.max(page, 1);
    const offset = normalizedSearchTerm
      ? FIRST_PAGE_OFFSET
      : (currentPage - 1) * PAGE_SIZE;
    const queryParams = new URLSearchParams({
      limit: normalizedSearchTerm ? '100000' : String(PAGE_SIZE),
      offset: String(offset),
    });

    if (normalizedSearchTerm) {
      queryParams.set('search', normalizedSearchTerm);
    }

    const response = await fetch(`${this.apiBaseUrl}/pokemon?${queryParams}`);

    if (!response.ok) {
      throw new Error('Не удалось загрузить список покемонов.');
    }

    const data = (await response.json()) as PokemonListResponse;
    const filteredResults = data.results.filter((pokemon) =>
      normalizedSearchTerm ? pokemon.name.includes(normalizedSearchTerm) : true
    );
    const pageResults = normalizedSearchTerm
      ? filteredResults.slice(
          (currentPage - 1) * PAGE_SIZE,
          currentPage * PAGE_SIZE
        )
      : filteredResults;
    const totalItems = normalizedSearchTerm
      ? filteredResults.length
      : data.count;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    const pokemons = await Promise.all(
      pageResults.map((pokemon) => this.getPokemonByName(pokemon.name))
    );

    return {
      pokemons,
      totalPages,
    };
  }

  async getPokemonById(id: number): Promise<Pokemon> {
    const response = await fetch(`${this.apiBaseUrl}/pokemon/${id}`);

    if (!response.ok) {
      throw new Error('Не удалось загрузить покемона.');
    }

    const pokemon = (await response.json()) as PokemonDetailsResponse;
    const description = await this.getPokemonDescription(pokemon.id);

    return this.normalizePokemon(pokemon, description);
  }

  private async getPokemonByName(name: string): Promise<Pokemon> {
    const response = await fetch(`${this.apiBaseUrl}/pokemon/${name}`);

    if (!response.ok) {
      throw new Error('Не удалось загрузить покемона.');
    }

    const pokemon = (await response.json()) as PokemonDetailsResponse;
    const description = await this.getPokemonDescription(pokemon.id);

    return this.normalizePokemon(pokemon, description);
  }

  private async getPokemonDescription(id: number): Promise<string> {
    const response = await fetch(`${this.apiBaseUrl}/pokemon-species/${id}`);

    if (!response.ok) {
      throw new Error('Не удалось загрузить описание покемона.');
    }

    const species = (await response.json()) as PokemonSpeciesResponse;
    const englishEntry = species.flavor_text_entries.find(
      (entry) => entry.language.name === 'en'
    );

    return this.formatDescription(
      englishEntry?.flavor_text ?? 'Нет опісанія для этого покемона'
    );
  }

  private formatDescription(description: string): string {
    return description.replace(/\s+/g, ' ');
  }

  private normalizePokemon(
    pokemon: PokemonDetailsResponse,
    description: string
  ): Pokemon {
    return {
      description,
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.sprites.front_default ?? '',
    };
  }
}

export const api = new Api('https://pokeapi.co/api/v2/');
