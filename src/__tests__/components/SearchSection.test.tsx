import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '../test-utils';
import SearchSection from '../../components/SearchSection/SearchSection';

describe('SearchSection', () => {
  beforeEach(() => {
    globalThis.history.replaceState({}, '', '/');
  });

  it('renders the server action search form with the current term from URL', () => {
    globalThis.history.replaceState({}, '', '/?search=pikachu');

    render(<SearchSection />);

    expect(screen.getByRole('searchbox')).toHaveValue('pikachu');
    expect(screen.getByRole('searchbox')).toHaveAttribute('name', 'search');
  });

  it('passes current routing state through hidden form fields', () => {
    globalThis.history.replaceState({}, '', '/details/25?page=2&search=pika');

    render(<SearchSection />);

    expect(screen.getByDisplayValue('/details/25')).toHaveAttribute(
      'name',
      'pathname'
    );
    expect(screen.getByDisplayValue('page=2&search=pika')).toHaveAttribute(
      'name',
      'currentSearch'
    );
  });
});
