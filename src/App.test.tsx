import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from './__tests__/test-utils';
import { pokemonList } from './__tests__/test-utils/mockData';
import App from './App';
import { api } from './services/api';

vi.mock('./services/api', async () => {
  const actual = await vi.importActual<typeof import('./services/api')>(
    './services/api'
  );

  return {
    ...actual,
    api: {
      getPokemons: vi.fn(),
    },
  };
});

describe('App', () => {
  const getPokemonsMock = vi.mocked(api.getPokemons);

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    localStorage.clear();
    getPokemonsMock.mockReset();
  });

  it('загрузка покемонгов прі открытіі прілагі', async () => {
    localStorage.setItem('pokemon-search-term', 'bulbasaur');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 1 });

    render(<App />);

    expect(getPokemonsMock).toHaveBeenCalledWith('bulbasaur', 1);
    expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();
  });

  it('загружает покемонов с пустым поиском если localStorage пустой', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: [], totalPages: 0 });

    render(<App />);

    await waitFor(() => {
      expect(localStorage.getItem).toHaveBeenCalledWith('pokemon-search-term');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'pokemon-search-term',
        ''
      );
      expect(getPokemonsMock).toHaveBeenCalledWith('', 1);
    });
  });

  it('записывает новый поисковый запрос в localStorage после поиска', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: [], totalPages: 0 });

    render(<App />);

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

  it('обновляет сохраненный запрос при повторном поиске', async () => {
    const user = userEvent.setup();
    localStorage.setItem('pokemon-search-term', 'pikachu');
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
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'pokemon-search-term',
        'raichu'
      );
      expect(getPokemonsMock).toHaveBeenLastCalledWith('raichu', 1);
    });
  });

  it('показать ошібку прі неудачной звгрузкі', async () => {
    getPokemonsMock.mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Не удалось загрузить данные. Проверьте запрос и попробуйте снова.'
        )
      ).toBeInTheDocument();
    });
  });

  it('показывает пагинацию после загрузки элементов', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<App />);

    expect(
      await screen.findByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('обновляет page параметр при смене страницы', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<App />);

    await screen.findByRole('navigation', { name: 'Pagination' });
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(window.location.search).toBe('?page=2');
      expect(getPokemonsMock).toHaveBeenLastCalledWith('', 2);
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });
  });

  it('синхронизирует видимую страницу со страницей из URL', async () => {
    window.history.replaceState({}, '', '/?page=2');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 3 });

    render(<App />);

    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    expect(getPokemonsMock).toHaveBeenCalledWith('', 2);
  });

  it('сбрасывает страницу в URL при новом поиске', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/?page=2');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 3 });

    render(<App />);

    await screen.findByText('Page 2 of 3');
    await user.type(screen.getByRole('searchbox'), 'mew');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(window.location.search).toBe('?page=1');
      expect(getPokemonsMock).toHaveBeenLastCalledWith('mew', 1);
    });
  });
});
