import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from './__tests__/test-utils';
import { bulbasaur, pokemonList } from './__tests__/test-utils/mockData';
import AppRoutes from './AppRoutes';
import { api } from './services/api';

vi.mock('./services/api', async () => {
  const actual = await vi.importActual<typeof import('./services/api')>(
    './services/api'
  );

  return {
    ...actual,
    api: {
      getPokemonById: vi.fn(),
      getPokemons: vi.fn(),
    },
  };
});

describe('App', () => {
  const getPokemonByIdMock = vi.mocked(api.getPokemonById);
  const getPokemonsMock = vi.mocked(api.getPokemons);

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    localStorage.clear();
    getPokemonByIdMock.mockReset();
    getPokemonsMock.mockReset();
  });

  it('loads Pokemons when opening the app', async () => {
    localStorage.setItem('pokemon-search-term', 'bulbasaur');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 1 });

    render(<AppRoutes />);

    expect(getPokemonsMock).toHaveBeenCalledWith('bulbasaur', 1);
    expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();
  });

  it('loads Pokemons with empty search if localStorage is empty', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: [], totalPages: 0 });

    render(<AppRoutes />);

    await waitFor(() => {
      expect(localStorage.getItem).toHaveBeenCalledWith('pokemon-search-term');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'pokemon-search-term',
        ''
      );
      expect(getPokemonsMock).toHaveBeenCalledWith('', 1);
    });
  });

  it('writes a new search request to localStorage after search', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: [], totalPages: 0 });

    render(<AppRoutes />);

    await waitFor(() => {
      expect(getPokemonsMock).toHaveBeenCalledWith('', 1);
    });

    await user.type(screen.getByRole('searchbox'), '  mew  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'pokemon-search-term',
        'mew'
      );
      expect(getPokemonsMock).toHaveBeenLastCalledWith('mew', 1);
      expect(window.location.search).toBe('?page=1');
    });
  });

  it('updates the saved request on repeated search', async () => {
    const user = userEvent.setup();
    localStorage.setItem('pokemon-search-term', 'pikachu');
    getPokemonsMock.mockResolvedValue({ pokemons: [], totalPages: 0 });

    render(<AppRoutes />);

    const searchbox = screen.getByRole('searchbox');

    await waitFor(() => {
      expect(searchbox).toHaveValue('pikachu');
    });

    await user.clear(searchbox);
    await user.type(searchbox, 'raichu');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'pokemon-search-term',
        'raichu'
      );
      expect(getPokemonsMock).toHaveBeenLastCalledWith('raichu', 1);
    });
  });

  it('shows an error on failed loading', async () => {
    getPokemonsMock.mockRejectedValue(new Error('Network error'));

    render(<AppRoutes />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Failed to load data. Check the request and try again.'
        )
      ).toBeInTheDocument();
    });
  });

  it('shows pagination after loading items', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

    expect(
      await screen.findByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('updates the page parameter when changing page', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

    await screen.findByRole('navigation', { name: 'Pagination' });
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(window.location.search).toBe('?page=2');
      expect(getPokemonsMock).toHaveBeenLastCalledWith('', 2);
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });
  });

  it('synchronizes the visible page with the page from URL', async () => {
    window.history.replaceState({}, '', '/?page=2');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 3 });

    render(<AppRoutes />);

    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    expect(getPokemonsMock).toHaveBeenCalledWith('', 2);
  });

  it('resets the page in URL on new search', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/?page=2');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 3 });

    render(<AppRoutes />);

    await screen.findByText('Page 2 of 3');
    await user.type(screen.getByRole('searchbox'), 'mew');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(window.location.search).toBe('?page=1');
      expect(getPokemonsMock).toHaveBeenLastCalledWith('mew', 1);
    });
  });

  it('opens the details panel on the right when clicking an item', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);

    render(<AppRoutes />);

    await user.click(await screen.findByRole('button', { name: /bulbasaur/i }));

    expect(
      await screen.findByRole('complementary', { name: 'Pokemon details' })
    ).toBeInTheDocument();
    expect(getPokemonByIdMock).toHaveBeenCalledWith(1);
    expect(window.location.pathname).toBe('/details/1');
    expect(window.location.search).toBe('?page=1');
  });

  it('closes the details panel with the close button', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);

    render(<AppRoutes />);

    await user.click(await screen.findByRole('button', { name: /bulbasaur/i }));
    await screen.findByRole('button', { name: 'Close' });
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
      expect(window.location.search).toBe('?page=1');
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  it('shows the loader while loading detailed information', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockReturnValue(new Promise(() => undefined));

    render(<AppRoutes />);

    await user.click(await screen.findByRole('button', { name: /bulbasaur/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');
  });

  it('closes the details panel by clicking the main panel', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockResolvedValue(bulbasaur);

    render(<AppRoutes />);

    await user.click(await screen.findByRole('button', { name: /bulbasaur/i }));
    await screen.findByRole('button', { name: 'Close' });
    await user.click(screen.getByRole('heading', { name: 'Pokemons Results' }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
      expect(window.location.search).toBe('?page=1');
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  it('keeps the details panel closed before choosing a Pokemon', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

    await screen.findByRole('heading', { name: 'Pokemons Results' });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });
});
