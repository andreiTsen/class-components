import type { ReactNode } from 'react';
import { Outlet, useMatch } from 'react-router';
import { parsePositiveInteger } from '../../utils/parsePositiveInteger';
import './PokemonResultsLayout.css';

type PokemonResultsLayoutProperties = {
  children: ReactNode;
};

function PokemonResultsLayout({ children }: PokemonResultsLayoutProperties) {
  const selectedPokemonId = parsePositiveInteger(
    useMatch('/details/:pokemonId')?.params.pokemonId
  );

  return (
    <div className="master-detail-layout">
      <div className="master-pane">{children}</div>
      {selectedPokemonId && <Outlet />}
    </div>
  );
}

export default PokemonResultsLayout;
