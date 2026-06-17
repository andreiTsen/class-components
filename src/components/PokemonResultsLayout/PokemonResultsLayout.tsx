import type { ReactNode } from 'react';
import './PokemonResultsLayout.css';

type PokemonResultsLayoutProperties = {
  children: ReactNode;
  details?: ReactNode;
};

function PokemonResultsLayout({
  children,
  details,
}: PokemonResultsLayoutProperties) {
  return (
    <div className="master-detail-layout">
      <div className="master-pane">{children}</div>
      {details}
    </div>
  );
}

export default PokemonResultsLayout;
