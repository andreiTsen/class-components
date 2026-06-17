import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen, userEvent } from '../test-utils';
import { pokemonList } from '../test-utils/mockData';
import ResultsSection from '../../components/ResultsSection/ResultsSection';

const { getPokemonsQueryMock } = vi.hoisted(() => ({
  getPokemonsQueryMock: vi.fn(),
}));

const POKEMON_LIST_QUERY_OPTIONS = {
  refetchOnFocus: false,
  refetchOnReconnect: false,
};

vi.mock('../../services/pokemonApi', async () => {
  const actual = await vi.importActual('../../services/pokemonApi');

  return {
    ...actual,
    useGetPokemonsQuery: getPokemonsQueryMock,
  };
});

const mockGetPokemonsQuery = (queryResult: Record<string, unknown> = {}) => {
  getPokemonsQueryMock.mockReturnValue({
    data: { pokemons: [], totalPages: 1 },
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    ...queryResult,
  });
};

const renderResultsSection = (
  properties: Partial<ComponentProps<typeof ResultsSection>> = {}
) => render(<ResultsSection currentPage={1} searchTerm="" {...properties} />);

describe('ResultsSection', () => {
  beforeEach(() => {
    globalThis.history.replaceState({}, '', '/');
    mockGetPokemonsQuery();
  });

  it('loads Pokemons for the current page', () => {
    mockGetPokemonsQuery({
      data: { pokemons: pokemonList, totalPages: 3 },
    });

    renderResultsSection({ currentPage: 2 });

    expect(getPokemonsQueryMock).toHaveBeenCalledWith(
      {
        page: 2,
        searchTerm: '',
      },
      POKEMON_LIST_QUERY_OPTIONS
    );
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('loads Pokemons with the search term from props', () => {
    renderResultsSection({ searchTerm: '  pika  ' });

    expect(getPokemonsQueryMock).toHaveBeenCalledWith(
      {
        page: 1,
        searchTerm: 'pika',
      },
      POKEMON_LIST_QUERY_OPTIONS
    );
  });

  it('renders loader', () => {
    mockGetPokemonsQuery({ data: undefined, isLoading: true });

    renderResultsSection();

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('renders error message', () => {
    mockGetPokemonsQuery({ data: undefined, isError: true });

    renderResultsSection();

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('refreshes results on button click', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    mockGetPokemonsQuery({ refetch });
    renderResultsSection();

    await user.click(screen.getByRole('button', { name: 'Refresh results' }));

    expect(refetch).toHaveBeenCalled();
  });

  it('renders emptiness with an empty list', () => {
    renderResultsSection();

    expect(screen.getByText('No pokemons found.')).toBeInTheDocument();
  });

  it('renders Pokemon cards', () => {
    mockGetPokemonsQuery({
      data: { pokemons: pokemonList, totalPages: 1 },
    });

    renderResultsSection();

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

  it('renders a checkbox for each Pokemon', () => {
    mockGetPokemonsQuery({
      data: { pokemons: pokemonList, totalPages: 1 },
    });

    renderResultsSection();

    expect(
      screen.getByRole('checkbox', { name: 'Select bulbasaur' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Select charmander' })
    ).toBeInTheDocument();
  });

  it('changes checkbox selection without opening details', async () => {
    const user = userEvent.setup();
    mockGetPokemonsQuery({
      data: { pokemons: pokemonList, totalPages: 1 },
    });

    renderResultsSection();

    await user.click(
      screen.getByRole('checkbox', { name: 'Select bulbasaur' })
    );

    expect(
      screen.getByRole('checkbox', { name: 'Select bulbasaur' })
    ).toBeChecked();
    expect(globalThis.location.pathname).toBe('/');
  });

  it('renders pagination after loading multiple pages', () => {
    mockGetPokemonsQuery({
      data: { pokemons: pokemonList, totalPages: 3 },
    });

    renderResultsSection({ currentPage: 2 });

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

  it('keeps pagination usable during background fetching', () => {
    mockGetPokemonsQuery({
      data: { pokemons: pokemonList, totalPages: 3 },
      isFetching: true,
    });

    renderResultsSection({ currentPage: 2 });

    expect(
      screen.getByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/?page=1'
    );
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'href',
      '/?page=3'
    );
  });
});
