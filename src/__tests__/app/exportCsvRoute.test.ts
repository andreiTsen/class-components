import { describe, expect, it } from 'vitest';
import { POST } from '../../app/api/export-csv/route';
import { bulbasaur } from '../test-utils/mockData';

describe('export CSV route', () => {
  it('generates and sends selected items as a CSV file from the server', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/export-csv', {
        body: JSON.stringify({ items: [bulbasaur] }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    );

    await expect(response.text()).resolves.toBe(
      [
        'id,name,description,imageUrl,detailsUrl',
        '1,bulbasaur,likes eating bulb.,https://example.com/bulbasaur.png,http://localhost:3000/details/1',
      ].join('\n')
    );
    expect(response.headers.get('Content-Type')).toBe('text/csv;charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="1_items.csv"'
    );
  });
});
