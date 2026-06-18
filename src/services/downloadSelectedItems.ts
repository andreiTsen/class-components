import type { Pokemon } from '../types';
import { downloadBlob } from '../utils/downloadBlob';

export const downloadSelectedItems = async (
  selectedItems: Pokemon[]
): Promise<void> => {
  const response = await fetch('/api/export-csv', {
    body: JSON.stringify({ items: selectedItems }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to export selected items.');
  }

  const blob = await response.blob();

  downloadBlob(blob, `${String(selectedItems.length)}_items.csv`);
};
