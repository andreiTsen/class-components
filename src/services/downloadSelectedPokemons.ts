import type { Pokemon } from '../types';
import { createCsvContent } from '../utils/createCsvContent';
import { downloadBlob } from '../utils/downloadBlob';

const getSelectedPokemonsCsv = (selectedPokemons: Pokemon[]): string => {
  const header = ['id', 'name', 'description', 'imageUrl', 'detailsUrl'];
  const rows = selectedPokemons.map((pokemon) => [
    pokemon.id,
    pokemon.name,
    pokemon.description,
    pokemon.imageUrl,
    `${globalThis.location.origin}/details/${String(pokemon.id)}`,
  ]);

  return createCsvContent([header, ...rows]);
};

export const downloadSelectedPokemons = (selectedPokemons: Pokemon[]): void => {
  const blob = new Blob([getSelectedPokemonsCsv(selectedPokemons)], {
    type: 'text/csv;charset=utf-8',
  });

  downloadBlob(blob, `${String(selectedPokemons.length)}_items.csv`);
};
