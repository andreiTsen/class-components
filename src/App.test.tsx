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
    localStorage.clear();
    getPokemonsMock.mockReset();
  });

  it('загрузка покемонгов прі открытіі прілагі', async () => {
    localStorage.setItem('pokemon-search-term', 'bulbasaur');
    getPokemonsMock.mockResolvedValue(pokemonList);

    render(<App />);

    expect(getPokemonsMock).toHaveBeenCalledWith('bulbasaur');
    expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();
  });

  it('загружает покемонов с пустым поиском если localStorage пустой', async () => {
    getPokemonsMock.mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(localStorage.getItem).toHaveBeenCalledWith('pokemon-search-term');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'pokemon-search-term',
        ''
      );
      expect(getPokemonsMock).toHaveBeenCalledWith('');
    });
  });

  it('записывает новый поисковый запрос в localStorage после поиска', async () => {
    const user = userEvent.setup();
    getPokemonsMock.mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(getPokemonsMock).toHaveBeenCalledWith('');
    });

    await user.type(screen.getByRole('searchbox'), '  mew  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'pokemon-search-term',
        'mew'
      );
      expect(getPokemonsMock).toHaveBeenLastCalledWith('mew');
    });
  });

  it('обновляет сохраненный запрос при повторном поиске', async () => {
    const user = userEvent.setup();
    localStorage.setItem('pokemon-search-term', 'pikachu');
    getPokemonsMock.mockResolvedValue([]);

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
      expect(getPokemonsMock).toHaveBeenLastCalledWith('raichu');
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
});
