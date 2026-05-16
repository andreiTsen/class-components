import { describe, expect, it } from 'vitest';
import { render, screen } from '../__tests__/test-utils';
import AppRoutes from '../AppRoutes';

describe('Page404', () => {
  it('рендерит 404 для неизвестного маршрута и ссылку домой', () => {
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
