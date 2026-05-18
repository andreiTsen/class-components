import { describe, expect, it } from 'vitest';
import { render, screen } from '../test-utils';
import AppRoutes from '../../AppRoutes';

describe('Page404', () => {
  it('renders 404 for unknown route and a link home', () => {
    window.history.replaceState({}, '', '/unknown-route');

    render(<AppRoutes />);

    expect(
      screen.getByRole('heading', { name: 'Page not found' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('The page you are looking for does not exist.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to app' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
