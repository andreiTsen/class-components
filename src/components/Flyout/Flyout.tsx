import type { Pokemon } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { unselectAllPokemons } from '../../store/selectedPokemonSlice';
import { createCsvContent } from '../../utils/createCsvContent';
import { downloadBlob } from '../../utils/downloadBlob';

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

const downloadSelectedPokemons = (selectedPokemons: Pokemon[]): void => {
  const blob = new Blob([getSelectedPokemonsCsv(selectedPokemons)], {
    type: 'text/csv;charset=utf-8',
  });

  downloadBlob(blob, `${String(selectedPokemons.length)}_items.csv`);
};

function Flyout() {
  const dispatch = useAppDispatch();
  const selectedPokemons = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemons
  );
  const selectedCount = selectedPokemons.length;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <aside className="flyout" aria-label="Selected Pokemon actions">
      <strong>{selectedCount} selected</strong>
      <div className="flyout-controls">
        <button
          type="button"
          onClick={(): void => {
            dispatch(unselectAllPokemons());
          }}
        >
          Unselect all
        </button>
        <button
          type="button"
          onClick={(): void => {
            downloadSelectedPokemons(selectedPokemons);
          }}
        >
          Download
        </button>
      </div>
    </aside>
  );
}

export default Flyout;
