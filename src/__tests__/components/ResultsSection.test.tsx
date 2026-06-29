import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import { pokemonList } from '../test-utils/mockData';
import ResultsSection from '../../components/ResultsSection/ResultsSection';

type ResultsSectionProperties = ComponentProps<typeof ResultsSection>;

const renderResultsSection = (properties: ResultsSectionProperties = {}) =>
  render(
    <ResultsSection
      pokemonPage={{ pokemons: [], totalPages: 0 }}
      {...properties}
    />
  );

describe('ResultsSection', () => {
  beforeEach(() => {
    globalThis.history.replaceState({}, '', '/');
  });

  it('renders the current page from URL', () => {
    globalThis.history.replaceState({}, '', '/?page=2');

    renderResultsSection({
      pokemonPage: { pokemons: pokemonList, totalPages: 3 },
    });

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('renders loader', () => {
    renderResultsSection({ isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('renders error message', () => {
    renderResultsSection({ error: true });

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('refreshes results on button click', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    renderResultsSection({ onRefresh });
    await user.click(screen.getByRole('button', { name: 'Refresh results' }));

    expect(onRefresh).toHaveBeenCalled();
  });

  it('renders emptiness with an empty list', () => {
    renderResultsSection();

    expect(screen.getByText('No pokemons found.')).toBeInTheDocument();
  });

  it('renders Pokemon cards', () => {
    renderResultsSection({
      pokemonPage: { pokemons: pokemonList, totalPages: 1 },
    });

    expect(
      screen.getByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByAltText('bulbasaur')).toHaveAttribute('src');
    expect(screen.getByAltText('bulbasaur').getAttribute('src')).toContain(
      encodeURIComponent(pokemonList[0].imageUrl)
    );
    expect(
      screen.getByRole('heading', { name: 'charmander' })
    ).toBeInTheDocument();
  });

  it('renders a checkbox for each Pokemon', () => {
    renderResultsSection({
      pokemonPage: { pokemons: pokemonList, totalPages: 1 },
    });

    expect(
      screen.getByRole('checkbox', { name: 'Select bulbasaur' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Select charmander' })
    ).toBeInTheDocument();
  });

  it('changes checkbox selection without opening details', async () => {
    const user = userEvent.setup();

    renderResultsSection({
      pokemonPage: { pokemons: pokemonList, totalPages: 1 },
    });

    await user.click(
      screen.getByRole('checkbox', { name: 'Select bulbasaur' })
    );

    expect(
      screen.getByRole('checkbox', { name: 'Select bulbasaur' })
    ).toBeChecked();
    expect(globalThis.location.pathname).toBe('/');
  });

  it('renders pagination after loading multiple pages', () => {
    globalThis.history.replaceState({}, '', '/?page=2');

    renderResultsSection({
      pokemonPage: { pokemons: pokemonList, totalPages: 3 },
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

  it('keeps pagination usable during loading', () => {
    globalThis.history.replaceState({}, '', '/?page=2');

    renderResultsSection({
      isLoading: true,
      pokemonPage: { pokemons: pokemonList, totalPages: 3 },
    });

    expect(
      screen.getByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });
});
