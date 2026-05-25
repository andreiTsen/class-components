import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import SearchSection from '../../components/SearchSection/SearchSection';

describe('SearchSection', () => {
  it('loads saved search term from props', () => {
    render(<SearchSection onSearch={vi.fn()} initialSearchTerm="pikachu" />);

    expect(screen.getByRole('searchbox')).toHaveValue('pikachu');
  });

  it('trims and sends search term', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchSection onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox'), '  eevee  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith('eevee');
    expect(screen.getByRole('searchbox')).toHaveValue('eevee');
  });

  it('sends empty string if only spaces are entered', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchSection onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox'), '     ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith('');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
});
