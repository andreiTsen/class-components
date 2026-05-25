import type { Pokemon } from '../../types';

type SelectedPokemonActionsProperties = {
  onClearAll: () => void;
  onDownload: () => void;
  selectedPokemons: Pokemon[];
};

function SelectedPokemonActions({
  onClearAll,
  onDownload,
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
        <button type="button" onClick={onDownload}>
          Download
        </button>
      </div>
    </aside>
  );
}

export default SelectedPokemonActions;
