import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useGetPokemonsQuery } from '../../services/pokemonApi';
import type { Pokemon } from '../../types';
import { parsePositiveInteger } from '../../utils/parsePositiveInteger';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import '../StatusMessage.css';
import Pagination from './Pagination';
import PokemonResultItem from './PokemonResultItem';
import './ResultsSection.css';

const EMPTY_POKEMONS: Pokemon[] = [];

const getPageFromSearchParameters = (
  searchParameters: URLSearchParams
): number => {
  return parsePositiveInteger(searchParameters.get('page')) ?? 1;
};

const usePageParameterNormalization = (
  pathname: string,
  router: ReturnType<typeof useRouter>,
  searchParameters: URLSearchParams
): number => {
  const currentPage = getPageFromSearchParameters(searchParameters);

  useEffect(() => {
    if (searchParameters.get('page') === String(currentPage)) {
      return;
    }

    const nextSearchParameters = new URLSearchParams(searchParameters);
    nextSearchParameters.set('page', String(currentPage));

    router.replace(`${pathname}?${nextSearchParameters.toString()}`);
  }, [currentPage, pathname, router, searchParameters]);

  return currentPage;
};

type ResultsSectionProperties = {
  handleRefresh: () => void;
  searchTerm: string;
};

function ResultsSection({
  handleRefresh,
  searchTerm,
}: ResultsSectionProperties) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const search = searchParameters.toString();
  const currentPage = usePageParameterNormalization(
    pathname,
    router,
    new URLSearchParams(search)
  );
  const { data, isError, isFetching } = useGetPokemonsQuery({
    page: currentPage,
    searchTerm: searchTerm.trim(),
  });
  const [isLoading, setIsLoading] = useState(isFetching && !data);
  const error = isError ? 'Failed to load data' : '';
  const pokemons = data?.pokemons ?? EMPTY_POKEMONS;
  const totalPages = data?.totalPages ?? 0;
  const shouldShowLoader = isLoading && !data;
  const showPagination: boolean = !error && totalPages > 1;

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      setIsLoading(isFetching && !data);
    }, 0);

    return (): void => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [data, isFetching]);

  return (
    <section className="results-section" aria-labelledby="results-title">
      <div>
        <h2 id="results-title">Pokemon Results</h2>
        <p>Submitted Pokemon</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={shouldShowLoader}
        >
          Refresh results
        </button>
      </div>

      {shouldShowLoader && <LoadingIndicator />}
      {error && <p className="status-message status-message-error">{error}</p>}
      {!shouldShowLoader && !error && pokemons.length === 0 && (
        <p className="status-message">No pokemons found.</p>
      )}

      <div className="result-list">
        {pokemons.map((pokemon) => (
          <PokemonResultItem key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          isLoading={shouldShowLoader}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}

export default ResultsSection;
