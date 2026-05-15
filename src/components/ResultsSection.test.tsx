import { describe, expect, it } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen } from '../__tests__/test-utils';
import { pokemonList } from '../__tests__/test-utils/mockData';
import ResultsSection from './ResultsSection';

const renderResultsSection = (
  props: Partial<ComponentProps<typeof ResultsSection>> = {}
) =>
  render(
    <ResultsSection
      currentPage={1}
      error=""
      isLoading={false}
      onPageChange={() => undefined}
      pokemons={[]}
      totalPages={1}
      {...props}
    />
  );

describe('ResultsSection', () => {
  it('рендерит загрузчик', () => {
    renderResultsSection({ isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('рендерит сообщение об ошібке', () => {
    renderResultsSection({ error: 'Не удалось загрузить данные' });

    expect(screen.getByText('Не удалось загрузить данные')).toBeInTheDocument();
  });

  it('рендерит пустоту при пустом списке', () => {
    renderResultsSection();

    expect(screen.getByText('No pokemons found.')).toBeInTheDocument();
  });

  it('рендерит карточки покемонов', () => {
    renderResultsSection({ pokemons: pokemonList });

    expect(screen.getByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByAltText('bulbasaur image')).toHaveAttribute(
      'src',
      pokemonList[0].imageUrl
    );
    expect(screen.getByRole('heading', { name: 'charmander' })).toBeInTheDocument();
  });

  it('рендерит пагинацию после загрузки нескольких страниц', () => {
    renderResultsSection({
      currentPage: 2,
      pokemons: pokemonList,
      totalPages: 3,
    });

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toHaveAttribute('aria-current', 'page');
  });
});
