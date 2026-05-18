import type { Pokemon } from '../../services/api';

export const bulbasaur: Pokemon = {
  description: 'likes eating bulb.',
  id: 1,
  imageUrl: 'https://example.com/bulbasaur.png',
  name: 'bulbasaur',
};

export const charmander: Pokemon = {
  description: 'Likes hot places.',
  id: 4,
  imageUrl: '',
  name: 'charmander',
};

export const pokemonList: Pokemon[] = [bulbasaur, charmander];
