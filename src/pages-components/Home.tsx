import type { ReactNode } from 'react';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import Layout from '../components/Layout/Layout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSectionController from '../components/SearchSection/SearchSectionController';
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
  selectedPokemonId,
}: HomeProperties) {
  return (
    <Layout>
      <main className="application-page">
        <SearchSectionController initialSearchTerm={initialSearchTerm} />
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
    </Layout>
  );
}

export default Home;
