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

  it('загрузка покемонгов прі открытіі прілагі', async () => {
    localStorage.setItem('pokemon-search-term', 'bulbasaur');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 1 });

    render(<AppRoutes />);

    expect(getPokemonsMock).toHaveBeenCalledWith('bulbasaur', 1);
    expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();
  });

  it('загружает покемонов с пустым поиском если localStorage пустой', async () => {
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

  it('записывает новый поисковый запрос в localStorage после поиска', async () => {
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

  it('обновляет сохраненный запрос при повторном поиске', async () => {
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

  it('показать ошібку прі неудачной звгрузкі', async () => {
    getPokemonsMock.mockRejectedValue(new Error('Network error'));

    render(<AppRoutes />);

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

    render(<AppRoutes />);

    expect(
      await screen.findByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('обновляет page параметр при смене страницы', async () => {
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

  it('синхронизирует видимую страницу со страницей из URL', async () => {
    window.history.replaceState({}, '', '/?page=2');
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 3 });

    render(<AppRoutes />);

    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();
    expect(getPokemonsMock).toHaveBeenCalledWith('', 2);
  });

  it('сбрасывает страницу в URL при новом поиске', async () => {
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

  it('открывает детальную панель справа при клике по элементу', async () => {
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

  it('закрывает детальную панель кнопкой закрытия', async () => {
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
      expect(
        screen.getByText('Select a Pokemon to view details.')
      ).toBeInTheDocument();
    });
  });

  it('показывает загрузчик во время загрузки детальной информации', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });
    getPokemonByIdMock.mockReturnValue(new Promise(() => undefined));

    render(<AppRoutes />);

    await user.click(await screen.findByRole('button', { name: /bulbasaur/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Loading details...');
  });

  it('закрывает детальную панель кликом по главной панели', async () => {
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
      expect(
        screen.getByText('Select a Pokemon to view details.')
      ).toBeInTheDocument();
    });
  });

  it('показывает skeleton деталей до выбора покемона', async () => {
    getPokemonsMock.mockResolvedValue({ pokemons: pokemonList, totalPages: 2 });

    render(<AppRoutes />);

    expect(
      await screen.findByText('Select a Pokemon to view details.')
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });
});
