import { describe, expect, it } from 'vitest';
import { render, screen } from '../__tests__/test-utils';
import Header from './Header';

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
      '/about'
    );
  });
});

