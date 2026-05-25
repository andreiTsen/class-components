import { describe, expect, it } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen } from '../test-utils';
import { pokemonList } from '../test-utils/mockData';
import ResultsSection from '../../components/ResultsSection/ResultsSection';

const renderResultsSection = (
  properties: Partial<ComponentProps<typeof ResultsSection>> = {}
) =>
  render(
    <ResultsSection
      currentPage={1}
      error=""
      isLoading={false}
      onPokemonSelect={() => undefined}
      pokemons={[]}
      totalPages={1}
      {...properties}
    />
  );

describe('ResultsSection', () => {
  it('renders loader', () => {
    renderResultsSection({ isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('renders error message', () => {
    renderResultsSection({ error: 'Failed to load data' });

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders emptiness with an empty list', () => {
    renderResultsSection();

    expect(screen.getByText('No pokemons found.')).toBeInTheDocument();
  });

  it('renders Pokemon cards', () => {
    renderResultsSection({ pokemons: pokemonList });

    expect(
      screen.getByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByAltText('bulbasaur')).toHaveAttribute(
      'src',
      pokemonList[0].imageUrl
    );
    expect(
      screen.getByRole('heading', { name: 'charmander' })
    ).toBeInTheDocument();
  });

  it('renders pagination after loading multiple pages', () => {
    renderResultsSection({
      currentPage: 2,
      pokemons: pokemonList,
      totalPages: 3,
    });

    expect(
      screen.getByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/?page=1'
    );
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'href',
      '/?page=3'
    );
  });

  it('keeps pagination visible and disables links while loading', () => {
    renderResultsSection({
      currentPage: 2,
      isLoading: true,
      pokemons: pokemonList,
      totalPages: 3,
    });

    expect(
      screen.getByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Previous' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Next' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Previous')).toHaveClass(
      'pagination-link-disabled'
    );
    expect(screen.getByText('Next')).toHaveClass('pagination-link-disabled');
  });
});
