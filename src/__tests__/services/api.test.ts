import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../services/api';

const jsonResponse = (body: unknown, ok = true) =>
  new Response(JSON.stringify(body), {
    status: ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });

const pokemonListResponse = {
  count: 4,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
  ],
};

const bulbasaurResponse = {
  id: 1,
  name: 'bulbasaur',
  species: {
    name: 'bulbasaur',
  },
  sprites: {
    front_default: 'https://example.com/bulbasaur.png',
  },
};

const charmanderResponse = {
  id: 4,
  name: 'charmander',
  species: {
    name: 'charmander',
  },
  sprites: {
    front_default: null,
  },
};

const ivysaurResponse = {
  id: 2,
  name: 'ivysaur',
  species: {
    name: 'ivysaur',
  },
  sprites: {
    front_default: 'https://example.com/ivysaur.png',
  },
};

const venusaurResponse = {
  id: 3,
  name: 'venusaur',
  species: {
    name: 'venusaur',
  },
  sprites: {
    front_default: 'https://example.com/venusaur.png',
  },
};

const megaVenusaurResponse = {
  id: 10033,
  name: 'venusaur-mega',
  species: {
    name: 'venusaur',
  },
  sprites: {
    front_default: 'https://example.com/venusaur-mega.png',
  },
};

const speciesResponse = {
  flavor_text_entries: [
    {
      flavor_text: 'Some description',
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

  it('loads Pokemon page', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse(ivysaurResponse))
      .mockResolvedValueOnce(jsonResponse(venusaurResponse))
      .mockResolvedValueOnce(jsonResponse(charmanderResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
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
          description: 'Some description',
          id: 1,
          imageUrl: 'https://example.com/bulbasaur.png',
          name: 'bulbasaur',
        },
        {
          description: 'Some description',
          id: 2,
          imageUrl: 'https://example.com/ivysaur.png',
          name: 'ivysaur',
        },
        {
          description: 'Some description',
          id: 3,
          imageUrl: 'https://example.com/venusaur.png',
          name: 'venusaur',
        },
        {
          description: 'No description for this Pokemon',
          id: 4,
          imageUrl: '',
          name: 'charmander',
        },
      ],
      totalPages: 1,
    });
  });

  it('filters Pokemons by name', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse(ivysaurResponse))
      .mockResolvedValueOnce(jsonResponse(venusaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse));

    const pokemonPage = await api.getPokemons('  SAUR ');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0'
    );
    expect(fetchMock).toHaveBeenCalledTimes(7);
    expect(pokemonPage.pokemons).toHaveLength(3);
    expect(pokemonPage.pokemons[0].name).toBe('bulbasaur');
    expect(pokemonPage.pokemons[1].name).toBe('ivysaur');
    expect(pokemonPage.pokemons[2].name).toBe('venusaur');
    expect(pokemonPage.totalPages).toBe(1);
  });

  it('error while loading Pokemon list', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false));

    await expect(api.getPokemons()).rejects.toThrow(
      'Failed to load Pokemon list.'
    );
  });

  it('error while loading Pokemon data', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse({}, false));

    await expect(api.getPokemons()).rejects.toThrow('Failed to load Pokemon.');
  });

  it('error while loading Pokemon description', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse({}, false));

    await expect(api.getPokemons('bulb')).rejects.toThrow(
      'Failed to load Pokemon description.'
    );
  });

  it('loads Pokemon by id for the details panel', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse));

    const pokemon = await api.getPokemonById(1);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://pokeapi.co/api/v2/pokemon/1'
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://pokeapi.co/api/v2/pokemon-species/bulbasaur'
    );
    expect(pokemon).toEqual({
      description: 'Some description',
      id: 1,
      imageUrl: 'https://example.com/bulbasaur.png',
      name: 'bulbasaur',
    });
  });

  it('rejects invalid Pokemon id before making a request', async () => {
    await expect(api.getPokemonById('abc')).rejects.toThrow(
      'Invalid Pokemon id.'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads description by species name for Pokemon forms', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          count: 1,
          results: [
            {
              name: 'venusaur-mega',
              url: 'https://pokeapi.co/api/v2/pokemon/10033/',
            },
          ],
        })
      )
      .mockResolvedValueOnce(jsonResponse(megaVenusaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse));

    const pokemonPage = await api.getPokemons('venusaur-mega');

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://pokeapi.co/api/v2/pokemon-species/venusaur'
    );
    expect(pokemonPage.pokemons[0]).toEqual({
      description: 'Some description',
      id: 10033,
      imageUrl: 'https://example.com/venusaur-mega.png',
      name: 'venusaur-mega',
    });
  });
});
