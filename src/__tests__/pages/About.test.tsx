import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import App from '../../App';

const setupEmptyPokemonApiMock = () => {
  const fetchMock = vi.fn(() =>
    Promise.resolve(
      Response.json(
        { count: 0, results: [] },
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )
  );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

describe('About', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the about', async () => {
    const user = userEvent.setup();
    const fetchMock = setupEmptyPokemonApiMock();

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
    expect(fetchMock).toHaveBeenCalled();
  });
});
