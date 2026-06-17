'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAppLocale, getLocalizedPathname } from '../../i18n/pathname';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import { pokemonApi, useGetPokemonByIdQuery } from '../../services/pokemonApi';
import { useAppDispatch } from '../../store/hooks';
import '../StatusMessage.css';
import './PokemonDetails.css';

type PokemonDetailsProperties = {
  pokemonId: string;
};

function PokemonDetails({ pokemonId }: PokemonDetailsProperties) {
  const router = useRouter();
  const locale = getAppLocale(useLocale());
  const t = useTranslations('PokemonDetails');
  const loadingT = useTranslations('Loading');
  const searchParameters = useSearchParams();
  const dispatch = useAppDispatch();
  const {
    data: pokemon,
    isError,
    isFetching,
  } = useGetPokemonByIdQuery(pokemonId, { skip: !pokemonId });
  const [isLoading, setIsLoading] = useState(isFetching && !pokemon);
  const shouldShowLoader = !pokemon && (isLoading || !isError);

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      setIsLoading(isFetching && !pokemon);
    }, 0);

    return (): void => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [isFetching, pokemon]);

  const handleCloseDetails = (): void => {
    const search = searchParameters.toString();
    const homePathname = getLocalizedPathname('/', locale);

    router.push(search ? `${homePathname}?${search}` : homePathname);
  };

  const handleRefresh = (): void => {
    if (!pokemonId) {
      return;
    }

    dispatch(
      pokemonApi.util.invalidateTags([
        { type: 'PokemonDetails', id: pokemon?.id ?? pokemonId },
      ])
    );
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

      {pokemon && !shouldShowLoader && !isError && (
        <div className="details-content">
          {pokemon.imageUrl && (
            <img src={pokemon.imageUrl} alt={pokemon.name} />
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
