import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders forms page', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'React Forms' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open Uncontrolled Form' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open React Hook Form' })
    ).toBeInTheDocument();
    expect(screen.getByText('No submissions yet')).toBeInTheDocument();
  });
});
