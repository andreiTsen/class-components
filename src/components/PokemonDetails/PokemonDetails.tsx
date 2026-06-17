'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

    router.push(search ? `/?${search}` : '/');
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
    <aside className="details-pane" aria-label="Pokemon details">
      <button
        className="details-close-button"
        type="button"
        onClick={handleCloseDetails}
      >
        Close
      </button>
      <button type="button" onClick={handleRefresh} disabled={isFetching}>
        Refresh details
      </button>

      {shouldShowLoader && <LoadingIndicator label="Loading details..." />}

      {isError && (
        <p className="status-message status-message-error">
          Failed to load Pokemon data.
        </p>
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
