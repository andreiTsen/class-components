import { useCallback } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorTestButton from './components/ErrorTestButton';
import usePokemonSearch from './hooks/usePokemonSearch';
import './App.css';

function App() {
  const detailsMatch = useMatch('/details/:pokemonId');
  const navigate = useNavigate();
  const {
    currentPage,
    error,
    getSearchWithCurrentPage,
    isLoading,
    loadPage,
    loadPokemons,
    pokemons,
    totalPages,
  } = usePokemonSearch();
  const selectedPokemonId = detailsMatch?.params.pokemonId
    ? Number(detailsMatch.params.pokemonId)
    : null;

  const handlePokemonSelect = useCallback(
    (pokemonId: number) => {
      navigate({
        pathname: `/details/${pokemonId}`,
        search: getSearchWithCurrentPage(),
      });
    },
    [getSearchWithCurrentPage, navigate]
  );

  const handleCloseDetails = useCallback(() => {
    navigate({
      pathname: '/',
      search: getSearchWithCurrentPage(),
    });
  }, [getSearchWithCurrentPage, navigate]);

  return (
    <div className="page">
      <Header />
      <ErrorBoundary>
        <main className="application-page">
          <SearchSection onSearch={loadPokemons} />
          <div className="master-detail-layout">
            <div
              className="master-pane"
              onClick={selectedPokemonId ? handleCloseDetails : undefined}
            >
              <ResultsSection
                currentPage={currentPage}
                error={error}
                isLoading={isLoading}
                onPageChange={loadPage}
                onPokemonSelect={handlePokemonSelect}
                pokemons={pokemons}
                selectedPokemonId={selectedPokemonId}
                totalPages={totalPages}
              />
            </div>
            {selectedPokemonId && (
              <Outlet context={{ onClose: handleCloseDetails }} />
            )}
          </div>
          <ErrorTestButton />
        </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;
