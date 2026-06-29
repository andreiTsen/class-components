import type { Pokemon } from '../types';

export const downloadSelectedItems = (selectedItems: Pokemon[]): void => {
  const ids = selectedItems.map((item) => String(item.id)).join(',');

  if (!ids) {
    return;
  }

  globalThis.location.assign(`/api/export-csv?ids=${encodeURIComponent(ids)}`);
};
