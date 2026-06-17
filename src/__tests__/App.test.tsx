import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from './test-utils';
import { bulbasaur, pokemonList } from './test-utils/mockData';
import App from '../App';
import { localStorageMock } from '../setupTests';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_ERROR = 500;

type PokemonApiMockOptions = {
  failDetails?: boolean;
  failList?: boolean;
  pendingDetails?: boolean;
  pokemons?: typeof pokemonList;
  totalPages?: number;
};

type FetchMock = ReturnType<
  typeof vi.fn<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >
>;
type FetchMockCall = [RequestInfo | URL, RequestInit?];

const DETAILS_FETCH_COUNT_AFTER_DETAILS_OPEN = 3;
const DETAILS_FETCH_COUNT_AFTER_DETAILS_REFRESH = 4;

const getRequestUrl = (input: RequestInfo | URL): string => {
  return input instanceof Request ? input.url : String(input);
};

const jsonResponse = (body: unknown, ok = true): Response =>
  Response.json(body, {
    status: ok ? HTTP_STATUS_OK : HTTP_STATUS_ERROR,
    headers: { 'Content-Type': 'application/json' },
  });

const getPokemonListResponse = (
  pokemons: typeof pokemonList,
  totalPages: number
) => ({
  count: totalPages * 10,
  results: pokemons.map((pokemon) => ({
    name: pokemon.name,
    url: `https://pokeapi.co/api/v2/pokemon/${String(pokemon.id)}/`,
  })),
});

const getPokemonDetailsResponse = (pokemon: (typeof pokemonList)[number]) => ({
  id: pokemon.id,
  name: pokemon.name,
  species: {
    name: pokemon.name,
  },
  sprites: {
    front_default: pokemon.imageUrl || null,
  },
});

const getPokemonSpeciesResponse = (pokemon: (typeof pokemonList)[number]) => ({
  flavor_text_entries: [
    {
      flavor_text: pokemon.description,
      language: { name: 'en' },
    },
  ],
});

const setupPokemonApiMock = ({
  failDetails = false,
  failList = false,
  pendingDetails = false,
  pokemons = pokemonList,
  totalPages = 2,
}: PokemonApiMockOptions = {}) => {
  const fetchMock: FetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = getRequestUrl(input);

    if (url.includes('/pokemon?')) {
      return Promise.resolve(
        jsonResponse(getPokemonListResponse(pokemons, totalPages), !failList)
      );
    }

    if (url.includes('/pokemon-species/')) {
      const pokemon = pokemons.find((item) => url.endsWith(`/${item.name}`));

      return Promise.resolve(
        jsonResponse(getPokemonSpeciesResponse(pokemon ?? bulbasaur))
      );
    }

    if (url.includes('/pokemon/')) {
      const isSelectedPokemonDetailsRequest = url.endsWith('/pokemon/1');

      if (pendingDetails && isSelectedPokemonDetailsRequest) {
        return new Promise<Response>(() => undefined);
      }

      const pokemon = pokemons.find(
        (item) =>
          url.endsWith(`/${String(item.id)}`) || url.endsWith(`/${item.name}`)
      );

      return Promise.resolve(
        jsonResponse(
          getPokemonDetailsResponse(pokemon ?? bulbasaur),
          !(failDetails && isSelectedPokemonDetailsRequest)
        )
      );
    }

    return Promise.resolve(jsonResponse({}));
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

const getPokemonListFetchCalls = (fetchMock: FetchMock): FetchMockCall[] =>
  fetchMock.mock.calls.filter((call): call is FetchMockCall =>
    getRequestUrl(call[0]).includes('/pokemon?')
  );

const getPokemonDetailsFetchCalls = (fetchMock: FetchMock): FetchMockCall[] =>
  fetchMock.mock.calls.filter((call): call is FetchMockCall =>
    getRequestUrl(call[0]).includes('/pokemon/')
  );

describe('App', () => {
  const CACHE_START_TIME = Number('1000');
  const CACHE_EXPIRED_TIME = Number('62000');

  beforeEach(() => {
    globalThis.history.replaceState({}, '', '/');
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads Pokemons when opening the app', async () => {
    localStorageMock.setItem('pokemon-search-term', 'bulbasaur');
    const fetchMock = setupPokemonApiMock({ totalPages: 1 });

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();
    expect(getRequestUrl(fetchMock.mock.calls[0][0])).toContain(
      'limit=100000&offset=0'
    );
  });

  it('loads Pokemons with empty search if localStorage is empty', async () => {
    const fetchMock = setupPokemonApiMock({ pokemons: [], totalPages: 0 });

    render(<App />);

    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'pokemon-search-term'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-search-term',
        ''
      );
      expect(getRequestUrl(fetchMock.mock.calls[0][0])).toContain(
        'limit=10&offset=0'
      );
    });
  });

  it('reuses cached Pokemon data after returning to a visited page', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock();

    render(<App />);

    await screen.findByRole('heading', { name: 'bulbasaur' });
    await user.click(screen.getByRole('link', { name: 'Next' }));
    await waitFor(() => {
      expect(globalThis.location.search).toBe('?page=2');
    });
    await user.click(await screen.findByRole('link', { name: 'Previous' }));
    await waitFor(() => {
      expect(globalThis.location.search).toBe('?page=1');
    });

    expect(getPokemonListFetchCalls(fetchMock)).toHaveLength(2);
  });

  it('does not reuse persisted Pokemon data after cache TTL expires', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(CACHE_START_TIME);
    const fetchMock = setupPokemonApiMock({ totalPages: 1 });
    const firstVisit = render(<App />);

    await screen.findByRole('heading', { name: 'bulbasaur' });
    firstVisit.unmount();

    clock.mockReturnValue(CACHE_EXPIRED_TIME);
    render(<App />);

    await screen.findByRole('heading', { name: 'bulbasaur' });
    expect(getPokemonListFetchCalls(fetchMock)).toHaveLength(2);
  });

  it('reuses cached Pokemon details after reopening the details route', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock();

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );
    await waitFor(() => {
      expect(screen.queryByText('Loading details...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole('article', { name: /bulbasaur/i }));

    expect(
      await screen.findByRole('complementary', { name: 'Pokemon details' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Loading details...')).not.toBeInTheDocument();
    expect(getPokemonDetailsFetchCalls(fetchMock)).toHaveLength(
      DETAILS_FETCH_COUNT_AFTER_DETAILS_OPEN
    );
  });

  it('writes a new search request to localStorage after search', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock({ pokemons: [], totalPages: 0 });

    render(<App />);

    await waitFor(() => {
      expect(getPokemonListFetchCalls(fetchMock)).toHaveLength(1);
    });

    await user.type(screen.getByRole('searchbox'), '  mew  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-search-term',
        'mew'
      );
      expect(getPokemonListFetchCalls(fetchMock)).toHaveLength(2);
      expect(globalThis.location.search).toBe('?page=1');
    });
  });

  it('updates the saved request on repeated search', async () => {
    const user = userEvent.setup();
    localStorageMock.setItem('pokemon-search-term', 'pikachu');
    const fetchMock = setupPokemonApiMock({ pokemons: [], totalPages: 0 });

    render(<App />);

    const searchbox = screen.getByRole('searchbox');

    await waitFor(() => {
      expect(searchbox).toHaveValue('pikachu');
    });

    await user.clear(searchbox);
    await user.type(searchbox, 'raichu');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-search-term',
        'raichu'
      );
      expect(getPokemonListFetchCalls(fetchMock)).toHaveLength(2);
    });
  });

  it('shows an error on failed loading', async () => {
    setupPokemonApiMock({ failList: true });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  it('shows pagination after loading items', async () => {
    setupPokemonApiMock();

    render(<App />);

    expect(
      await screen.findByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('invalidates cache and reloads Pokemons after manual refresh', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock();

    render(<App />);

    await screen.findByRole('heading', { name: 'bulbasaur' });
    await user.click(screen.getByRole('button', { name: 'Refresh results' }));

    await waitFor(() => {
      expect(getPokemonListFetchCalls(fetchMock)).toHaveLength(2);
    });
  });

  it('updates the page parameter when changing page', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock();

    render(<App />);

    await screen.findByRole('navigation', { name: 'Pagination' });
    await user.click(screen.getByRole('link', { name: 'Next' }));

    await waitFor(() => {
      expect(globalThis.location.search).toBe('?page=2');
      const lastListCall = getPokemonListFetchCalls(fetchMock).at(-1);

      expect(lastListCall).toBeDefined();
      expect(getRequestUrl(lastListCall?.[0] ?? '')).toContain(
        'limit=10&offset=10'
      );
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });
  });

  it('synchronizes the visible page with the page from URL', async () => {
    globalThis.history.replaceState({}, '', '/?page=2');
    const fetchMock = setupPokemonApiMock({ totalPages: 3 });

    render(<App />);

    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    expect(getRequestUrl(getPokemonListFetchCalls(fetchMock)[0][0])).toContain(
      'limit=10&offset=10'
    );
  });

  it('resets the page in URL on new search', async () => {
    const user = userEvent.setup();
    globalThis.history.replaceState({}, '', '/?page=2');
    const fetchMock = setupPokemonApiMock({ totalPages: 3 });

    render(<App />);

    await screen.findByText('Page 2 of 3');
    await user.type(screen.getByRole('searchbox'), 'mew');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(globalThis.location.search).toBe('?page=1');
      const lastListCall = getPokemonListFetchCalls(fetchMock).at(-1);

      expect(lastListCall).toBeDefined();
      expect(getRequestUrl(lastListCall?.[0] ?? '')).toContain(
        'limit=100000&offset=0'
      );
    });
  });

  it('opens the details panel on the right when clicking an item', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock();

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );

    expect(
      await screen.findByRole('complementary', { name: 'Pokemon details' })
    ).toBeInTheDocument();
    expect(
      getPokemonDetailsFetchCalls(fetchMock).some(([input]) =>
        getRequestUrl(input).endsWith('/pokemon/1')
      )
    ).toBe(true);
    expect(globalThis.location.pathname).toBe('/en/details/1');
    expect(globalThis.location.search).toBe('?page=1');
  });

  it('keeps loaded details visible when clicking the already opened item again', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock();

    render(<App />);

    const bulbasaurItem = await screen.findByRole('article', {
      name: /bulbasaur/i,
    });

    await user.click(bulbasaurItem);

    expect(
      await screen.findByRole('complementary', { name: 'Pokemon details' })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Loading details...')).not.toBeInTheDocument();
    });

    await user.click(bulbasaurItem);

    expect(screen.queryByText('Loading details...')).not.toBeInTheDocument();
    expect(getPokemonDetailsFetchCalls(fetchMock)).toHaveLength(
      DETAILS_FETCH_COUNT_AFTER_DETAILS_OPEN
    );
  });

  it('selects an item with a checkbox without opening details', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock();

    render(<App />);

    const bulbasaurCheckbox = await screen.findByRole('checkbox', {
      name: 'Select bulbasaur',
    });

    await user.click(bulbasaurCheckbox);

    expect(bulbasaurCheckbox).toBeChecked();
    expect(
      screen.queryByRole('complementary', { name: 'Pokemon details' })
    ).not.toBeInTheDocument();
    expect(getPokemonDetailsFetchCalls(fetchMock)).toHaveLength(2);
    expect(globalThis.location.pathname).toBe('/');
  });

  it('shows a fixed actions menu with the selected item count', async () => {
    const user = userEvent.setup();
    setupPokemonApiMock();

    render(<App />);

    expect(
      screen.queryByRole('complementary', {
        name: 'Selected Pokemon actions',
      })
    ).not.toBeInTheDocument();

    await user.click(
      await screen.findByRole('checkbox', { name: 'Select bulbasaur' })
    );

    expect(
      screen.getByRole('complementary', { name: 'Selected Pokemon actions' })
    ).toBeInTheDocument();
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Unselect all' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download' })
    ).toBeInTheDocument();
  });

  it('unselects all checked items from the actions menu', async () => {
    const user = userEvent.setup();
    setupPokemonApiMock();

    render(<App />);

    const bulbasaurCheckbox = await screen.findByRole('checkbox', {
      name: 'Select bulbasaur',
    });
    const charmanderCheckbox = screen.getByRole('checkbox', {
      name: 'Select charmander',
    });

    await user.click(bulbasaurCheckbox);
    await user.click(charmanderCheckbox);
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Unselect all' }));

    expect(bulbasaurCheckbox).not.toBeChecked();
    expect(charmanderCheckbox).not.toBeChecked();
    expect(
      screen.queryByRole('complementary', {
        name: 'Selected Pokemon actions',
      })
    ).not.toBeInTheDocument();
  });

  it('downloads selected items as a CSV file', async () => {
    const user = userEvent.setup();

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    const createObjectUrlMock = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:selected-pokemons');
    const revokeObjectUrlMock = vi.spyOn(URL, 'revokeObjectURL');
    const clickMock = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    setupPokemonApiMock();

    render(<App />);

    await user.click(
      await screen.findByRole('checkbox', { name: 'Select bulbasaur' })
    );
    await user.click(screen.getByRole('button', { name: 'Download' }));

    expect(createObjectUrlMock).toHaveBeenCalledWith(expect.any(Blob));
    const downloadedBlob = createObjectUrlMock.mock.calls[0]?.[0];

    if (!(downloadedBlob instanceof Blob)) {
      throw new TypeError('Downloaded content must be a Blob.');
    }

    await expect(downloadedBlob.text()).resolves.toContain(
      'id,name,description,imageUrl,detailsUrl'
    );
    await expect(downloadedBlob.text()).resolves.toContain(
      '1,bulbasaur,likes eating bulb.,https://example.com/bulbasaur.png,http://localhost:3000/details/1'
    );
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:selected-pokemons');

    clickMock.mockRestore();
    createObjectUrlMock.mockRestore();
    revokeObjectUrlMock.mockRestore();
  });

  it('keeps checked items selected when navigating between result pages', async () => {
    const user = userEvent.setup();
    setupPokemonApiMock();

    render(<App />);

    await user.click(
      await screen.findByRole('checkbox', { name: 'Select bulbasaur' })
    );
    await user.click(screen.getByRole('link', { name: 'Next' }));

    await waitFor(() => {
      expect(globalThis.location.search).toBe('?page=2');
    });
    expect(
      screen.getByRole('checkbox', { name: 'Select bulbasaur' })
    ).toBeChecked();
  });

  it('removes an item from selected state when its checkbox is unchecked', async () => {
    const user = userEvent.setup();
    setupPokemonApiMock();

    render(<App />);

    const bulbasaurCheckbox = await screen.findByRole('checkbox', {
      name: 'Select bulbasaur',
    });

    await user.click(bulbasaurCheckbox);
    expect(bulbasaurCheckbox).toBeChecked();

    await user.click(bulbasaurCheckbox);
    expect(bulbasaurCheckbox).not.toBeChecked();
  });

  it('closes the details panel with the close button', async () => {
    const user = userEvent.setup();
    setupPokemonApiMock();

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );
    await screen.findByRole('button', { name: 'Close' });
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(globalThis.location.pathname).toBe('/en');
      expect(globalThis.location.search).toBe('?page=1');
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  it('shows the loader while loading detailed information', async () => {
    const user = userEvent.setup();
    setupPokemonApiMock({ pendingDetails: true });

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');
  });

  it('invalidates cache and reloads Pokemon details after manual refresh', async () => {
    const user = userEvent.setup();
    const fetchMock = setupPokemonApiMock();

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );
    await screen.findByRole('complementary', { name: 'Pokemon details' });
    await user.click(screen.getByRole('button', { name: 'Refresh details' }));

    await waitFor(() => {
      expect(getPokemonDetailsFetchCalls(fetchMock)).toHaveLength(
        DETAILS_FETCH_COUNT_AFTER_DETAILS_REFRESH
      );
    });
  });

  it('shows an error when detailed information cannot be loaded', async () => {
    const user = userEvent.setup();
    setupPokemonApiMock({ failDetails: true });

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );

    expect(
      await screen.findByText('Failed to load Pokemon data.')
    ).toBeInTheDocument();
  });

  it('keeps the details panel open when clicking the main panel', async () => {
    const user = userEvent.setup();
    setupPokemonApiMock();

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );
    await screen.findByRole('button', { name: 'Close' });
    await user.click(screen.getByRole('heading', { name: 'Pokemon Results' }));

    expect(globalThis.location.pathname).toBe('/en/details/1');
    expect(globalThis.location.search).toBe('?page=1');
    expect(
      screen.getByRole('complementary', { name: 'Pokemon details' })
    ).toBeInTheDocument();
  });

  it('keeps the details panel closed before choosing a Pokemon', async () => {
    setupPokemonApiMock();

    render(<App />);

    await screen.findByRole('heading', { name: 'Pokemon Results' });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(globalThis.location.pathname).toBe('/');
  });
});
