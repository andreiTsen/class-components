import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

type PokemonResultsLayoutProperties = {
  children: ReactNode;
  onCloseDetails: () => void;
  selectedPokemonId?: number | null;
};

function PokemonResultsLayout({
  children,
  onCloseDetails,
  selectedPokemonId,
}: PokemonResultsLayoutProperties) {
  return (
    <div className="master-detail-layout">
      <div className="master-pane">{children}</div>
      {selectedPokemonId && <Outlet context={{ onClose: onCloseDetails }} />}
    </div>
  );
}

export default PokemonResultsLayout;
