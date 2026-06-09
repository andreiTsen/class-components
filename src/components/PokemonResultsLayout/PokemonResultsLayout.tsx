import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

type PokemonResultsLayoutProperties = {
  children: ReactNode;
  selectedPokemonId?: number | null;
};

function PokemonResultsLayout({
  children,
  selectedPokemonId,
}: PokemonResultsLayoutProperties) {
  return (
    <div className="master-detail-layout">
      <div className="master-pane">{children}</div>
      {selectedPokemonId && <Outlet />}
    </div>
  );
}

export default PokemonResultsLayout;
