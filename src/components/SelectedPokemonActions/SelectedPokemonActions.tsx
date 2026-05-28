import type { Pokemon } from '../../types';

type SelectedPokemonActionsProperties = {
  downloadFileName: string;
  downloadHref: string;
  onClearAll: () => void;
  selectedPokemons: Pokemon[];
};

function SelectedPokemonActions({
  downloadFileName,
  downloadHref,
  onClearAll,
  selectedPokemons,
}: SelectedPokemonActionsProperties) {
  const selectedCount = selectedPokemons.length;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <aside className="selected-actions" aria-label="Selected Pokemon actions">
      <strong>{selectedCount} selected</strong>
      <div className="selected-actions-controls">
        <button type="button" onClick={onClearAll}>
          Unselect all
        </button>
        <a href={downloadHref} download={downloadFileName}>
          Download
        </a>
      </div>
    </aside>
  );
}

export default SelectedPokemonActions;
