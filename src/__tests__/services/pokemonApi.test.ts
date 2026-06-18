import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pokemonApi } from '../../services/pokemonApi';
import { setupStore } from '../../store/store';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_ERROR = 500;
const FILTERED_POKEMON_COUNT = 3;
const FILTERED_FETCH_COUNT = 7;
const IVYSAUR_INDEX = 1;
const VENUSAUR_INDEX = 2;

type FetchMock = ReturnType<
  typeof vi.fn<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >
>;

const jsonResponse = (body: unknown, ok = true): Response =>
  Response.json(body, {
    status: ok ? HTTP_STATUS_OK : HTTP_STATUS_ERROR,
    headers: { 'Content-Type': 'application/json' },
  });

const getRequestUrl = (input: RequestInfo | URL): string => {
  return input instanceof Request ? input.url : String(input);
};

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
  id: 10_033,
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

const createStore = (): ReturnType<typeof setupStore> => setupStore();

describe('pokemonApi', () => {
  const fetchMock: FetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads Pokemon page through RTK Query', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse(ivysaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse(venusaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse(charmanderResponse))
      .mockResolvedValueOnce(jsonResponse({ flavor_text_entries: [] }));

    const result = await createStore().dispatch(
      pokemonApi.endpoints.getPokemons.initiate({ page: 1, searchTerm: '' })
    );

    expect(getRequestUrl(fetchMock.mock.calls[0][0])).toBe(
      'https://pokeapi.co/api/v2/pokemon?limit=10&offset=0'
    );
    expect(result.data).toEqual({
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
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse(ivysaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse))
      .mockResolvedValueOnce(jsonResponse(venusaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse));

    const result = await createStore().dispatch(
      pokemonApi.endpoints.getPokemons.initiate({
        page: 1,
        searchTerm: '  SAUR ',
      })
    );

    expect(getRequestUrl(fetchMock.mock.calls[0][0])).toBe(
      'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0'
    );
    expect(fetchMock).toHaveBeenCalledTimes(FILTERED_FETCH_COUNT);
    expect(result.data?.pokemons).toHaveLength(FILTERED_POKEMON_COUNT);
    expect(result.data?.pokemons[0].name).toBe('bulbasaur');
    expect(result.data?.pokemons[IVYSAUR_INDEX].name).toBe('ivysaur');
    expect(result.data?.pokemons[VENUSAUR_INDEX].name).toBe('venusaur');
    expect(result.data?.totalPages).toBe(1);
  });

  it('handles errors while loading Pokemon list', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false));

    const result = await createStore().dispatch(
      pokemonApi.endpoints.getPokemons.initiate({ page: 1, searchTerm: '' })
    );

    expect(result.isError).toBe(true);
  });

  it('handles errors while loading Pokemon data', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse({}, false));

    const result = await createStore().dispatch(
      pokemonApi.endpoints.getPokemons.initiate({ page: 1, searchTerm: '' })
    );

    expect(result.isError).toBe(true);
  });

  it('handles errors while loading Pokemon description', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pokemonListResponse))
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse({}, false));

    const result = await createStore().dispatch(
      pokemonApi.endpoints.getPokemons.initiate({
        page: 1,
        searchTerm: 'bulb',
      })
    );

    expect(result.isError).toBe(true);
  });

  it('loads Pokemon by id for the details panel', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(bulbasaurResponse))
      .mockResolvedValueOnce(jsonResponse(speciesResponse));

    const result = await createStore().dispatch(
      pokemonApi.endpoints.getPokemonById.initiate(1)
    );

    expect(getRequestUrl(fetchMock.mock.calls[0][0])).toBe(
      'https://pokeapi.co/api/v2/pokemon/1'
    );
    expect(getRequestUrl(fetchMock.mock.calls[1][0])).toBe(
      'https://pokeapi.co/api/v2/pokemon-species/bulbasaur'
    );
    expect(result.data).toEqual({
      description: 'Some description',
      id: 1,
      imageUrl: 'https://example.com/bulbasaur.png',
      name: 'bulbasaur',
    });
  });

  it('rejects invalid Pokemon id before making a request', async () => {
    const result = await createStore().dispatch(
      pokemonApi.endpoints.getPokemonById.initiate('abc')
    );

    expect(result.isError).toBe(true);
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

    const result = await createStore().dispatch(
      pokemonApi.endpoints.getPokemons.initiate({
        page: 1,
        searchTerm: 'venusaur-mega',
      })
    );

    expect(getRequestUrl(fetchMock.mock.calls[2][0])).toBe(
      'https://pokeapi.co/api/v2/pokemon-species/venusaur'
    );
    expect(result.data?.pokemons[0]).toEqual({
      description: 'Some description',
      id: 10_033,
      imageUrl: 'https://example.com/venusaur-mega.png',
      name: 'venusaur-mega',
    });
  });
});
