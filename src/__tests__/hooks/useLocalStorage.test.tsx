import { vi } from 'vitest';
import { renderHook, act } from '../test-utils';
import useLocalStorage from '../../hooks/useLocalStorage';
import { localStorageMock } from '../../setupTests';

describe('useLocalStorage', () => {
  it('trims initial value from local storage', () => {
    localStorageMock.setItem('search-term', '  pikachu  ');

    const { result } = renderHook(() => useLocalStorage('search-term'));

    expect(result.current[0]).toBe('pikachu');
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
      'search-term',
      'pikachu'
    );
  });

  it('trims next value before saving it', () => {
    const { result } = renderHook(() => useLocalStorage('search-term'));

    act(() => {
      result.current[1]('  eevee  ');
    });

    expect(result.current[0]).toBe('eevee');
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
      'search-term',
      'eevee'
    );
  });

  it('uses initial value if local storage cannot be read', () => {
    vi.mocked(localStorageMock.getItem).mockImplementationOnce(() => {
      throw new Error('Storage is unavailable');
    });

    const { result } = renderHook(() =>
      useLocalStorage('search-term', '  fallback  ')
    );

    expect(result.current[0]).toBe('fallback');
  });

  it('updates state if local storage cannot be written', () => {
    vi.mocked(localStorageMock.setItem).mockImplementationOnce(() => {
      throw new Error('Storage is unavailable');
    });
    const { result } = renderHook(() => useLocalStorage('search-term'));

    act(() => {
      result.current[1]('  mew  ');
    });

    expect(result.current[0]).toBe('mew');
  });
});
