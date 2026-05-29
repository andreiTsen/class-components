import { downloadSelectedPokemons } from '../../services/downloadSelectedPokemons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { unselectAllPokemons } from '../../store/selectedPokemonSlice';

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
