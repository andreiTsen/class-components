import type { ComponentProps } from 'react';
import { Outlet } from 'react-router';
import ResultsSection from '../ResultsSection/ResultsSection';

type PokemonResultsLayoutProperties = Pick<
  ComponentProps<typeof ResultsSection>,
  | 'currentPage'
  | 'error'
  | 'isLoading'
  | 'onPokemonSelectionChange'
  | 'onPokemonSelect'
  | 'pokemons'
  | 'selectedPokemonId'
  | 'selectedPokemonIds'
  | 'totalPages'
> & {
  onCloseDetails: () => void;
};

function PokemonResultsLayout({
  currentPage,
  error,
  isLoading,
  onCloseDetails,
  onPokemonSelectionChange,
  onPokemonSelect,
  pokemons,
  selectedPokemonId,
  selectedPokemonIds,
  totalPages,
}: PokemonResultsLayoutProperties) {
  return (
    <div className="master-detail-layout">
      <div className="master-pane">
        <ResultsSection
          currentPage={currentPage}
          error={error}
          isLoading={isLoading}
          onPokemonSelectionChange={onPokemonSelectionChange}
          onPokemonSelect={onPokemonSelect}
          pokemons={pokemons}
          selectedPokemonId={selectedPokemonId}
          selectedPokemonIds={selectedPokemonIds}
          totalPages={totalPages}
        />
      </div>
      {selectedPokemonId && <Outlet context={{ onClose: onCloseDetails }} />}
    </div>
  );
}

export default PokemonResultsLayout;
