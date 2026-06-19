import { describe, expect, it } from 'vitest';
import { render, screen } from '../test-utils';
import SearchSection from '../../components/SearchSection/SearchSection';

describe('SearchSection', () => {
  it('renders the server action search form with the current term', () => {
    render(<SearchSection storedSearchTerm="pikachu" />);

    expect(screen.getByRole('searchbox')).toHaveValue('pikachu');
    expect(screen.getByRole('searchbox')).toHaveAttribute('name', 'search');
  });

  it('passes current routing state through hidden form fields', () => {
    render(
      <SearchSection
        currentSearchParameters={new URLSearchParams('page=2&search=pika')}
        pathname="/details/25"
        storedSearchTerm="pika"
      />
    );

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
