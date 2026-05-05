import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../__tests__/test-utils';
import SearchSection from './SearchSection';

describe('SearchSection', () => {
  it('загружает сохраненный терм поіска из локального хранилища', () => {
    localStorage.setItem('pokemon-search-term', 'pikachu');

    render(<SearchSection onSearch={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('pikachu');
  });

  it('обрезает и отправляет терм поіска', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchSection onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox'), '  eevee  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith('eevee');
    expect(screen.getByRole('searchbox')).toHaveValue('eevee');
  });
});

