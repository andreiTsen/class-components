import type { Pokemon } from '../types';
import { createCsvContent } from '../utils/createCsvContent';
import { downloadBlob } from '../utils/downloadBlob';

const getSelectedItemsCsv = (selectedItems: Pokemon[]): string => {
  const header = ['id', 'name', 'description', 'imageUrl', 'detailsUrl'];
  const rows = selectedItems.map((item) => [
    item.id,
    item.name,
    item.description,
    item.imageUrl,
    `${globalThis.location.origin}/details/${String(item.id)}`,
  ]);

  return createCsvContent([header, ...rows]);
};

export const downloadSelectedItems = (selectedItems: Pokemon[]): void => {
  const blob = new Blob([getSelectedItemsCsv(selectedItems)], {
    type: 'text/csv;charset=utf-8',
  });

  downloadBlob(blob, `${String(selectedItems.length)}_items.csv`);
};
