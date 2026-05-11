import { describe, expect, it } from 'vitest';
import { render, screen } from '../__tests__/test-utils';
import Header from './Header';

describe('Header', () => {
  it('рендеріт тітул', () => {
    render(<Header />);

    expect(
      screen.getByRole('heading', { name: 'Покемон суперсущество' })
    ).toBeInTheDocument();
  });
});

