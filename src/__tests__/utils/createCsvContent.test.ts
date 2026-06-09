import { describe, expect, it } from 'vitest';
import { createCsvContent } from '../../utils/createCsvContent';

const MEW_ID = 3;

describe('createCsvContent', () => {
  it('escapes values with commas, quotes, and line breaks', () => {
    expect(
      createCsvContent([
        ['id', 'name', 'description'],
        [1, 'bulbasaur', 'simple text'],
        [2, 'mr, mime', 'uses "quotes"'],
        [MEW_ID, 'mew', 'line\nbreak'],
      ])
    ).toBe(
      'id,name,description\n1,bulbasaur,simple text\n2,"mr, mime","uses ""quotes"""\n3,mew,"line\nbreak"'
    );
  });
});
