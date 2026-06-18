import type { Pokemon } from '../../../types';
import { createCsvContent } from '../../../utils/createCsvContent';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isPokemon = (value: unknown): value is Pokemon => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.imageUrl === 'string'
  );
};

const getSelectedItems = (body: unknown): Pokemon[] => {
  if (!isRecord(body) || !Array.isArray(body.items)) {
    return [];
  }

  return body.items.filter(isPokemon);
};

const getSelectedItemsCsv = (
  selectedItems: Pokemon[],
  origin: string
): string => {
  const header = ['id', 'name', 'description', 'imageUrl', 'detailsUrl'];
  const rows = selectedItems.map((item) => [
    item.id,
    item.name,
    item.description,
    item.imageUrl,
    `${origin}/details/${String(item.id)}`,
  ]);

  return createCsvContent([header, ...rows]);
};

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json();
  const selectedItems = getSelectedItems(body);
  const csv = getSelectedItemsCsv(selectedItems, new URL(request.url).origin);
  const fileName = `${String(selectedItems.length)}_items.csv`;

  return new Response(csv, {
    headers: {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'text/csv;charset=utf-8',
    },
  });
}
