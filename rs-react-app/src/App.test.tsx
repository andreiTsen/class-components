import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from './__tests__/test-utils';
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

