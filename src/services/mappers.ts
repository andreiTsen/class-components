import type { Pokemon, PokemonDetailsResponse } from '../types';

export const normalizePokemon = (
  pokemon: PokemonDetailsResponse,
  description: string
): Pokemon => ({
  description,
  id: pokemon.id,
  name: pokemon.name,
  imageUrl: pokemon.sprites.front_default ?? '',
});
