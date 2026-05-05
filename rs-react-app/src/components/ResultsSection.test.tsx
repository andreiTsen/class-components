import { describe, expect, it } from 'vitest';
import { render, screen } from '../__tests__/test-utils';
import { pokemonList } from '../__tests__/test-utils/mockData';
import ResultsSection from './ResultsSection';

describe('ResultsSection', () => {
  it('рендерит загрузчик', () => {
    render(<ResultsSection error="" isLoading pokemons={[]} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('рендерит сообщение об ошібке', () => {
    render(
      <ResultsSection
        error="Не удалось загрузить данные"
        isLoading={false}
        pokemons={[]}
      />
    );

    expect(screen.getByText('Не удалось загрузіть данные')).toBeInTheDocument();
  });

  it('рендерит пустоту при пустом списке', () => {
    render(<ResultsSection error="" isLoading={false} pokemons={[]} />);

    expect(screen.getByText('No pokemons found.')).toBeInTheDocument();
  });

  it('рендерит карточки покемонов', () => {
    render(<ResultsSection error="" isLoading={false} pokemons={pokemonList} />);

    expect(screen.getByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByAltText('bulbasaur image')).toHaveAttribute(
      'src',
      pokemonList[0].imageUrl
    );
    expect(screen.getByRole('heading', { name: 'charmander' })).toBeInTheDocument();
  });
});

