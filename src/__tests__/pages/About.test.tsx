import { describe, expect, it } from 'vitest';
import { render, screen } from '../test-utils';
import About from '../../pages-components/About';

describe('About', () => {
  it('renders the about page content', () => {
    render(<About />);

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
  });
});
