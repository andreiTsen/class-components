import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorTestButton from './components/ErrorTestButton';
import { api, type Pokemon } from './services/api';
import './App.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

function App() {
  const initialSearchTermRef = useRef(
    localStorage.getItem(SEARCH_TERM_STORAGE_KEY) ?? ''
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const lastSearchTermRef = useRef<string | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  const requestPokemons = useCallback(async (normalizedSearchTerm: string) => {
    localStorage.setItem(SEARCH_TERM_STORAGE_KEY, normalizedSearchTerm);

    try {
      const pokemons = await api.getPokemons(normalizedSearchTerm);

      lastSearchTermRef.current = normalizedSearchTerm;
      setPokemons(pokemons);
    } catch {
      setError(
        'Не удалось загрузить данные. Проверьте запрос и попробуйте снова.'
      );
      setPokemons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPokemons = useCallback(
    async (searchTerm = '') => {
      const normalizedSearchTerm = searchTerm.trim();

      if (lastSearchTermRef.current === normalizedSearchTerm) {
        return;
      }

      setError('');
      setIsLoading(true);

      await requestPokemons(normalizedSearchTerm);
    },
    [requestPokemons]
  );

  useEffect(() => {
    void requestPokemons(initialSearchTermRef.current);
  }, [requestPokemons]);

  return (
    <div className="page">
      <Header />
      <ErrorBoundary>
        <main className="application-page">
          <SearchSection onSearch={loadPokemons} />
          <ResultsSection
            error={error}
            isLoading={isLoading}
            pokemons={pokemons}
          />
          <ErrorTestButton />
        </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;
