import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import App from '../../App';
import { getPokemons } from '../../services/pokemonService';

vi.mock('../../services/pokemonService', () => ({
  getPokemonById: vi.fn(),
  getPokemons: vi.fn().mockResolvedValue({ pokemons: [], totalPages: 0 }),
}));

describe('About', () => {
  it('opens the about', async () => {
    const user = userEvent.setup();

    render(<App />);

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
    expect(globalThis.location.pathname).toBe('/about');
    expect(getPokemons).toHaveBeenCalled();
  });
});
