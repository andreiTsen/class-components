import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Pokemon } from '../../types';
import '../StatusMessage.css';
import './PokemonDetails.css';
import PokemonDetailsActions from './PokemonDetailsActions';

type PokemonDetailsProperties = {
  error?: boolean;
  pokemon?: Pokemon;
};

function PokemonDetails({ error = false, pokemon }: PokemonDetailsProperties) {
  const t = useTranslations('PokemonDetails');

  return (
    <aside className="details-pane" aria-label={t('title')}>
      <PokemonDetailsActions
        closeLabel={t('close')}
        refreshLabel={t('refresh')}
      />

      {error && (
        <p className="status-message status-message-error">{t('error')}</p>
      )}

      {pokemon && (
        <div className="details-content">
          {pokemon.imageUrl && (
            <Image
              src={pokemon.imageUrl}
              alt={pokemon.name}
              width={96}
              height={96}
            />
          )}
          <div>
            <h2>{pokemon.name}</h2>
            <strong>#{pokemon.id}</strong>
          </div>
          <p>{pokemon.description}</p>
        </div>
      )}
    </aside>
  );
}

export default PokemonDetails;
