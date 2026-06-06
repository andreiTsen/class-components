import { describe, expect, it } from 'vitest';
import countriesReducer from '../store/countriesSlice';

describe('countriesSlice', () => {
  it('stores country options for autocomplete', () => {
    const state = countriesReducer(undefined, { type: 'unknown' });

    expect(state.items).toContain('Poland');
    expect(state.items).toContain('Ukraine');
  });
});
