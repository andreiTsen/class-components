import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

const jsonResponse = (body: unknown, ok = true) =>
  new Response(JSON.stringify(body), {
    status: ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });

const pokemonListResponse = {
  count: 2,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
  ],
};

const bulbasaurResponse = {
  id: 1,
  name: 'bulbasaur',
  sprites: {
    front_default: 'https://example.com/bulbasaur.png',
  },
};

const charmanderResponse = {
  id: 4,
  name: 'charmander',
  sprites: {
    front_default: null,
  },
};

const speciesResponse = {
  flavor_text_entries: [
    {
      flavor_text: 'Какое то опісаніе',
      language: { name: 'en' },
    },
  ],
};

describe('api', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('загружает страницу покемонов', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse(charmanderResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse({ flavor_text_entries: [] }));

    const pokemonPage = await api.getPokemons();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://pokeapi.co/api/v2/pokemon?limit=10&offset=0'
    );
    expect(pokemonPage).toEqual({
      pokemons: [
        {
          description: 'Какое то опісаніе',
          id: 1,
          imageUrl: 'https://example.com/bulbasaur.png',
          name: 'bulbasaur',
        },
        {
          description: 'Нет опісанія для этого покемона',
          id: 4,
          imageUrl: '',
          name: 'charmander',
        },
      ],
      totalPages: 1,
    });
  });

  it('фильтрует покемонов по названию', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse));

    const pokemonPage = await api.getPokemons('  SAUR ');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0&search=saur'
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(pokemonPage.pokemons).toHaveLength(1);
    expect(pokemonPage.pokemons[0].name).toBe('bulbasaur');
    expect(pokemonPage.totalPages).toBe(1);
  });

  it('ошібка при загрузке списка покемонов', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false));

    await expect(api.getPokemons()).rejects.toThrow(
      'Не удалось загрузить список покемонов.'
    );
  });

  it('ошібка при загрузке данных покемона', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse({}, false));

    await expect(api.getPokemons()).rejects.toThrow(
      'Не удалось загрузить покемона.'
    );
  });

  it('ошібка при загрузке описания покемона', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse({}, false));

    await expect(api.getPokemons('bulb')).rejects.toThrow(
      'Не удалось загрузить описание покемона.'
    );
  });
});
