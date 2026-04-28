export type Pokemon = {
  id: number;
  name: string;
  imageUrl: string;
};

type PokemonListResponse = {
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

class Api {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
  }

  async getPokemons(searchTerm = ''): Promise<Pokemon[]> {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (normalizedSearchTerm) {
      const response = await fetch(
        `${this.apiBaseUrl}/pokemon/${normalizedSearchTerm}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }

        throw new Error('ошібка загрузкі покемонв');
      }

      const pokemon = (await response.json()) as PokemonDetailsResponse;

      return [this.normalizePokemon(pokemon)];
    }

    const response = await fetch(`${this.apiBaseUrl}/pokemon?limit=10`);

    if (!response.ok) {
      throw new Error('ошібка загрузкі покемонов');
    }

    const data = (await response.json()) as PokemonListResponse;

    return data.results.map((pokemon) => ({
      id: this.getPokemonIdFromUrl(pokemon.url),
      name: pokemon.name,
      imageUrl: '',
    }));
  }

  private getPokemonIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  private normalizePokemon(pokemon: PokemonDetailsResponse): Pokemon {
    return {
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.sprites.front_default ?? '',
    };
  }
}

export const api = new Api('https://pokeapi.co/api/v2/');
