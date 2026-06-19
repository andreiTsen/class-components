'use client';

import { useTranslations } from 'next-intl';
import { downloadSelectedItems } from '../../services/downloadSelectedItems';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { unselectAllPokemons } from '../../store/selectedPokemonSlice';
import './Flyout.css';

function Flyout() {
  const dispatch = useAppDispatch();
  const t = useTranslations('SelectedActions');
  const resultsT = useTranslations('Results');
  const selectedItems = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemons
  );
  const selectedCount = selectedItems.length;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <aside className="flyout" aria-label={t('label')}>
      <strong>{resultsT('selected', { count: selectedCount })}</strong>
      <div className="flyout-controls">
        <button
          type="button"
          onClick={(): void => {
            dispatch(unselectAllPokemons());
          }}
        >
          {t('unselectAll')}
        </button>
        <button
          type="button"
          onClick={(): void => {
            void downloadSelectedItems(selectedItems);
          }}
        >
          {t('download')}
        </button>
      </div>
    </aside>
  );
}

export default Flyout;
