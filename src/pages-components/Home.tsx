import type { ReactNode } from 'react';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import type { PokemonPage } from '../types';
import './Home.css';

type HomeProperties = {
  currentPage?: number;
  currentSearchParameters?: URLSearchParams;
  details?: ReactNode;
  initialSearchTerm?: string;
  isResultsLoading?: boolean;
  onRefreshResults?: () => void;
  pokemonPage?: PokemonPage;
  resultsError?: boolean;
  search?: ReactNode;
  selectedPokemonId?: number | null;
};

function Home({
  currentPage,
  currentSearchParameters,
  details,
  initialSearchTerm = '',
  isResultsLoading,
  onRefreshResults,
  pokemonPage,
  resultsError,
  search,
  selectedPokemonId,
}: HomeProperties) {
  const searchPathname = selectedPokemonId
    ? `/details/${String(selectedPokemonId)}`
    : '/';

  return (
    <main className="application-page">
      {search ?? (
        <SearchSection
          currentSearchParameters={currentSearchParameters}
          pathname={searchPathname}
          storedSearchTerm={initialSearchTerm}
        />
      )}
      <PokemonResultsLayout details={details}>
        <ResultsSection
          currentPage={currentPage}
          currentSearchParameters={currentSearchParameters}
          error={resultsError}
          isLoading={isResultsLoading}
          onRefresh={onRefreshResults}
          pokemonPage={pokemonPage}
          selectedPokemonId={selectedPokemonId}
        />
      </PokemonResultsLayout>
      <ErrorTestButton />
      <Flyout />
    </main>
  );
}

export default Home;
