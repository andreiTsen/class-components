import type { Pokemon } from '../../services/api';

export const bulbasaur: Pokemon = {
  description: 'любіт есть бульбу.',
  id: 1,
  imageUrl: 'https://example.com/bulbasaur.png',
  name: 'bulbasaur',
};

export const charmander: Pokemon = {
  description: 'Любит жаркие места.',
  id: 4,
  imageUrl: '',
  name: 'charmander',
};

export const pokemonList: Pokemon[] = [bulbasaur, charmander];

