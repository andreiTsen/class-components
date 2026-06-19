import { useTranslations } from 'next-intl';
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
  const t = useTranslations('PokemonDetails');

  return (
    <div className="master-detail-layout">
      <div className="master-pane">{children}</div>
      {details ?? (
        <aside
          className="details-pane details-pane-empty"
          aria-label={t('title')}
        >
          <p>{t('empty')}</p>
        </aside>
      )}
    </div>
  );
}

export default PokemonResultsLayout;
