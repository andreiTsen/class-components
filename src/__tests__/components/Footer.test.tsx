import { describe, expect, it } from 'vitest';
import { render, screen } from '../test-utils';
import Footer from '../../components/Footer/Footer';

describe('Footer', () => {
  it('renders footer', () => {
    render(<Footer />);

    expect(
      screen.getByText('Pokemon application by andreiTsen')
    ).toBeInTheDocument();
  });
});
