import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from './test-utils';
import { bulbasaur, pokemonList } from './test-utils/mockData';
import App from '../App';
import AppRoutes from '../AppRoutes';
import { getPokemonById, getPokemons } from '../services/pokemonService';
import { localStorageMock } from '../setupTests';

vi.mock('../services/pokemonService', () => ({
  getPokemonById: vi.fn(),
  getPokemons: vi.fn(),
}));

describe('App', () => {
  const CACHE_START_TIME = Number('1000');
  const CACHE_EXPIRED_TIME = Number('62000');
  const getPokemonByIdMock = vi.mocked(getPokemonById);
  const getPokemonsMock = vi.mocked(getPokemons);

  beforeEach(() => {
    globalThis.history.replaceState({}, '', '/');
    localStorageMock.clear();
    getPokemonByIdMock.mockReset();
    getPokemonsMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads Pokemons when opening the app', async () => {
    localStorageMock.setItem('pokemon-search-term', 'bulbasaur');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 1 });

    render(<App />);

    expect(getPokemonsMock).toHaveBeenCalledWith('bulbasaur', 1);
    expect(
      await screen.findByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();
  });

  it('loads Pokemons with empty search if localStorage is empty', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: [], totalPages: 0 });

    render(<App />);

    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'pokemon-search-term'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-search-term',
        ''
      );
      expect(getPokemonsMock).toHaveBeenCalledWith('', 1);
    });
  });

  it('reuses persisted Pokemon data after revisiting the app', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 1 });
    const firstVisit = render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();

    firstVisit.unmount();
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();
    expect(getPokemonsMock).toHaveBeenCalledTimes(1);
  });

  it('does not reuse persisted Pokemon data after cache TTL expires', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(CACHE_START_TIME);
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 1 });
    const firstVisit = render(<App />);

    await screen.findByRole('heading', { name: 'bulbasaur' });
    firstVisit.unmount();

    clock.mockReturnValue(CACHE_EXPIRED_TIME);
    render(<App />);

    await screen.findByRole('heading', { name: 'bulbasaur' });
    expect(getPokemonsMock).toHaveBeenCalledTimes(2);
  });

  it('reuses persisted Pokemon details after revisiting the details route', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);
    const firstVisit = render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );
    await waitFor(() => {
      expect(screen.queryByText('Loading details...')).not.toBeInTheDocument();
    });

    firstVisit.unmount();
    render(<App />);

    expect(
      await screen.findByRole('complementary', { name: 'Pokemon details' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Loading details...')).not.toBeInTheDocument();
    expect(getPokemonByIdMock).toHaveBeenCalledTimes(1);
  });

  it('writes a new search request to localStorage after search', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: [], totalPages: 0 });

    render(<App />);

    await waitFor(() => {
      expect(getPokemonsMock).toHaveBeenCalledWith('', 1);
    });

    await user.type(screen.getByRole('searchbox'), '  mew  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-search-term',
        'mew'
      );
      expect(getPokemonsMock).toHaveBeenLastCalledWith('mew', 1);
      expect(globalThis.location.search).toBe('?page=1');
    });
  });

  it('updates the saved request on repeated search', async () => {
    const user = userEvent.setup();
    localStorageMock.setItem('pokemon-search-term', 'pikachu');
    getPokemonsMock.mockResolvedValue({ pokemons: [], totalPages: 0 });

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
      expect(getPokemonsMock).toHaveBeenLastCalledWith('raichu', 1);
    });
  });

  it('shows an error on failed loading', async () => {
    getPokemonsMock.mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  it('shows pagination after loading items', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<App />);

    expect(
      await screen.findByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('invalidates cache and reloads Pokemons after manual refresh', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<App />);

    await screen.findByRole('heading', { name: 'bulbasaur' });
    await user.click(screen.getByRole('button', { name: 'Refresh results' }));

    await waitFor(() => {
      expect(getPokemonsMock).toHaveBeenCalledTimes(2);
    });
  });

  it('updates the page parameter when changing page', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<App />);

    await screen.findByRole('navigation', { name: 'Pagination' });
    await user.click(screen.getByRole('link', { name: 'Next' }));

    await waitFor(() => {
      expect(globalThis.location.search).toBe('?page=2');
      expect(getPokemonsMock).toHaveBeenLastCalledWith('', 2);
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });
  });

  it('synchronizes the visible page with the page from URL', async () => {
    globalThis.history.replaceState({}, '', '/?page=2');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 3 });

    render(<App />);

    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    expect(getPokemonsMock).toHaveBeenCalledWith('', 2);
  });

  it('resets the page in URL on new search', async () => {
    const user = userEvent.setup();
    globalThis.history.replaceState({}, '', '/?page=2');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 3 });

    render(<App />);

    await screen.findByText('Page 2 of 3');
    await user.type(screen.getByRole('searchbox'), 'mew');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(globalThis.location.search).toBe('?page=1');
      expect(getPokemonsMock).toHaveBeenLastCalledWith('mew', 1);
    });
  });

  it('opens the details panel on the right when clicking an item', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );

    expect(
      await screen.findByRole('complementary', { name: 'Pokemon details' })
    ).toBeInTheDocument();
    expect(getPokemonByIdMock).toHaveBeenCalledWith('1');
    expect(globalThis.location.pathname).toBe('/details/1');
    expect(globalThis.location.search).toBe('?page=1');
  });

  it('keeps loaded details visible when clicking the already opened item again', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);

    render(<AppRoutes />);

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
    expect(getPokemonByIdMock).toHaveBeenCalledTimes(1);
  });

  it('selects an item with a checkbox without opening details', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

    const bulbasaurCheckbox = await screen.findByRole('checkbox', {
      name: 'Select bulbasaur',
    });

    await user.click(bulbasaurCheckbox);

    expect(bulbasaurCheckbox).toBeChecked();
    expect(
      screen.queryByRole('complementary', { name: 'Pokemon details' })
    ).not.toBeInTheDocument();
    expect(getPokemonByIdMock).not.toHaveBeenCalled();
    expect(globalThis.location.pathname).toBe('/');
  });

  it('shows a fixed actions menu with the selected item count', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

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
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

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

    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

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
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

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
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

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
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );
    await screen.findByRole('button', { name: 'Close' });
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(globalThis.location.pathname).toBe('/');
      expect(globalThis.location.search).toBe('?page=1');
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  it('shows the loader while loading detailed information', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockReturnValue(new Promise(() => undefined));

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');
  });

  it('invalidates cache and reloads Pokemon details after manual refresh', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );
    await screen.findByRole('complementary', { name: 'Pokemon details' });
    await user.click(screen.getByRole('button', { name: 'Refresh details' }));

    await waitFor(() => {
      expect(getPokemonByIdMock).toHaveBeenCalledTimes(2);
    });
  });

  it('shows an error when detailed information cannot be loaded', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockRejectedValue(new Error('Network error'));

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );

    expect(
      await screen.findByText('Failed to load Pokemon data.')
    ).toBeInTheDocument();
  });

  it('closes the details panel by clicking the main panel', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);

    render(<App />);

    await user.click(
      await screen.findByRole('article', { name: /bulbasaur/i })
    );
    await screen.findByRole('button', { name: 'Close' });
    await user.click(screen.getByRole('heading', { name: 'Pokemons Results' }));

    await waitFor(() => {
      expect(globalThis.location.pathname).toBe('/');
      expect(globalThis.location.search).toBe('?page=1');
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  it('keeps the details panel closed before choosing a Pokemon', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<App />);

    await screen.findByRole('heading', { name: 'Pokemons Results' });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(globalThis.location.pathname).toBe('/');
  });
});
