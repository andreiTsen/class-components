import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import AppRoutes from '../../AppRoutes';
import { api } from '../../services/api';

vi.mock('../../services/api', async () => {
  const actual =
    await vi.importActual<typeof import('../../services/api')>(
      '../../services/api'
    );

  return {
    ...actual,
    api: {
      getPokemonById: vi.fn(),
      getPokemons: vi.fn().mockResolvedValue({ pokemons: [], totalPages: 0 }),
    },
  };
});

describe('AboutPage', () => {
  it('opens the about', async () => {
    const user = userEvent.setup();

    render(<AppRoutes />);

    await user.click(screen.getByRole('link', { name: 'About' }));

    expect(
      screen.getByRole('heading', { name: 'About this app' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Author: andreiTsen/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'My name is Andrei, My GitHub' })
    ).toHaveAttribute('href', 'https://github.com/andreiTsen');
    expect(
      screen.getByRole('link', { name: 'RS School React course' })
    ).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
    expect(window.location.pathname).toBe('/about');
    expect(api.getPokemons).toHaveBeenCalled();
  });
});
