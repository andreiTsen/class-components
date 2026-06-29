import type { ReactNode } from 'react';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import type { PokemonPage } from '../types';
import './Home.css';

type HomeProperties = {
  details?: ReactNode;
  isResultsLoading?: boolean;
  onRefreshResults?: () => void;
  pokemonPage?: PokemonPage;
  resultsError?: boolean;
  search?: ReactNode;
};

function Home({
  details,
  isResultsLoading,
  onRefreshResults,
  pokemonPage,
  resultsError,
  search,
}: HomeProperties) {
  return (
    <main className="application-page">
      {search ?? <SearchSection />}
      <PokemonResultsLayout details={details}>
        <ResultsSection
          error={resultsError}
          isLoading={isResultsLoading}
          onRefresh={onRefreshResults}
          pokemonPage={pokemonPage}
        />
      </PokemonResultsLayout>
      <ErrorTestButton />
      <Flyout />
    </main>
  );
}

export default Home;
