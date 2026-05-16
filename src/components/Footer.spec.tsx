import { describe, expect, it } from 'vitest';
import { render, screen } from '../__tests__/test-utils';
import Footer from './Footer';

describe('Footer', () => {
  it('renders footer', () => {
    render(<Footer />);

    expect(
      screen.getByText('Pokemon application by andreiTsen')
    ).toBeInTheDocument();
  });
});

