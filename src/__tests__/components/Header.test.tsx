import { describe, expect, it } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import Header from '../../components/Header/Header';

describe('Header', () => {
  it('renders title', () => {
    render(<Header />);

    expect(
      screen.getByRole('heading', { name: 'Pokemon super monster' })
    ).toBeInTheDocument();
  });

  it('renders link to the about page', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/en/about'
    );
  });

  it('toggles the application theme', async () => {
    const user = userEvent.setup();

    render(<Header />);

    await user.click(
      screen.getByRole('button', { name: 'Switch to dark theme' })
    );

    expect(
      screen
        .getByRole('banner', { name: 'Page header' })
        .closest('[data-theme="dark"]')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Switch to light theme' })
    ).toBeInTheDocument();
  });

  it('changes the locale from the language switcher', async () => {
    const user = userEvent.setup();

    render(<Header />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Language' }),
      'ru'
    );

    expect(globalThis.location.pathname).toBe('/ru');
  });
});
