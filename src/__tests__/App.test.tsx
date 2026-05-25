import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from './test-utils';
import { bulbasaur, pokemonList } from './test-utils/mockData';
import App from '../App';
import { getPokemonById, getPokemons } from '../services/pokemonService';
import { localStorageMock } from '../setupTests';

vi.mock('../services/pokemonService', () => ({
  getPokemonById: vi.fn(),
  getPokemons: vi.fn(),
}));

describe('App', () => {
  const getPokemonByIdMock = vi.mocked(getPokemonById);
  const getPokemonsMock = vi.mocked(getPokemons);

  beforeEach(() => {
    globalThis.history.replaceState({}, '', '/');
    localStorageMock.clear();
    getPokemonByIdMock.mockReset();
    getPokemonsMock.mockReset();
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
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
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
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
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
