import { downloadSelectedItems } from '../../services/downloadSelectedItems';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { unselectAllPokemons } from '../../store/selectedPokemonSlice';
import './Flyout.css';

function Flyout() {
  const dispatch = useAppDispatch();
  const selectedItems = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemons
  );
  const selectedCount = selectedItems.length;

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
            downloadSelectedItems(selectedItems);
          }}
        >
          Download
        </button>
      </div>
    </aside>
  );
}

export default Flyout;
