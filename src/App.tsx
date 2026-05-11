import { Component } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorTestButton from './components/ErrorTestButton';
import { api, type Pokemon } from './services/api';
import './App.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

type AppState = {
  error: string;
  isLoading: boolean;
  lastSearchTerm: string | null;
  pokemons: Pokemon[];
};

class App extends Component<Record<string, never>, AppState> {
  state: AppState = {
    error: '',
    isLoading: false,
    lastSearchTerm: null,
    pokemons: [],
  };

  componentDidMount() {
    const savedSearchTerm =
      localStorage.getItem(SEARCH_TERM_STORAGE_KEY) ?? '';

    this.loadPokemons(savedSearchTerm);
  }

  loadPokemons = async (searchTerm = '') => {
    const normalizedSearchTerm = searchTerm.trim();

    if (this.state.lastSearchTerm === normalizedSearchTerm) {
      return;
    }

    localStorage.setItem(SEARCH_TERM_STORAGE_KEY, normalizedSearchTerm);
    this.setState({ error: '', isLoading: true });

    try {
      const pokemons = await api.getPokemons(normalizedSearchTerm);

      this.setState({ lastSearchTerm: normalizedSearchTerm, pokemons });
    } catch {
      this.setState({
        error: 'Не удалось загрузить данные. Проверьте запрос и попробуйте снова.',
        pokemons: [],
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { error, isLoading, pokemons } = this.state;

    return (
      <div className="page">
        <Header />
        <ErrorBoundary>
          <main className="application-page">
            <SearchSection onSearch={this.loadPokemons} />
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
}

export default App;
