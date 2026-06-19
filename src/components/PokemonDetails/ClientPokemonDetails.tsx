'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../i18n/navigation';
import { getAppLocale } from '../../i18n/pathname';
import { useGetPokemonByIdQuery } from '../../services/pokemonApi';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import '../StatusMessage.css';
import './PokemonDetails.css';

type ClientPokemonDetailsProperties = {
  pokemonId: string;
};

function ClientPokemonDetails({ pokemonId }: ClientPokemonDetailsProperties) {
  const router = useRouter();
  const locale = getAppLocale(useLocale());
  const t = useTranslations('PokemonDetails');
  const loadingT = useTranslations('Loading');
  const searchParameters = useSearchParams();
  const {
    data: pokemon,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetPokemonByIdQuery(pokemonId, { skip: !pokemonId });
  const shouldShowLoader = isLoading || isFetching;

  const handleCloseDetails = (): void => {
    const search = searchParameters.toString();

    router.push(search ? `/?${search}` : '/', { locale });
  };

  const handleRefresh = (): void => {
    if (!pokemonId) {
      return;
    }

    void refetch();
  };

  return (
    <aside className="details-pane" aria-label={t('title')}>
      <button
        className="details-close-button"
        type="button"
        onClick={handleCloseDetails}
      >
        {t('close')}
      </button>
      <button type="button" onClick={handleRefresh} disabled={isFetching}>
        {t('refresh')}
      </button>

      {shouldShowLoader && <LoadingIndicator label={loadingT('details')} />}

      {isError && (
        <p className="status-message status-message-error">{t('error')}</p>
      )}

      {pokemon && !shouldShowLoader && (
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

export default ClientPokemonDetails;
