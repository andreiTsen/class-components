import type { Pokemon } from '../../../types';
import { createCsvContent } from '../../../utils/createCsvContent';
import { loadPokemonByIdOnServer } from '../../../services/pokemonServerLoaders';
import { isQueryError } from '../../../services/queryHelpers';

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

const createCsvResponse = (
  selectedItems: Pokemon[],
  origin: string
): Response => {
  const csv = getSelectedItemsCsv(selectedItems, origin);
  const fileName = `${String(selectedItems.length)}_items.csv`;

  return new Response(csv, {
    headers: {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'text/csv;charset=utf-8',
    },
  });
};

const getPokemonIds = (request: Request): number[] => {
  const ids = new URL(request.url).searchParams.get('ids') ?? '';

  return ids
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
};

export async function GET(request: Request): Promise<Response> {
  const selectedItems = await Promise.all(
    getPokemonIds(request).map((id) => loadPokemonByIdOnServer(id))
  );
  const validSelectedItems = selectedItems.filter(
    (item): item is Pokemon => !isQueryError(item)
  );

  return createCsvResponse(validSelectedItems, new URL(request.url).origin);
}

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json();
  const selectedItems = getSelectedItems(body);

  return createCsvResponse(selectedItems, new URL(request.url).origin);
}
