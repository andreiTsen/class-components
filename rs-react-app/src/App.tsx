import { Component } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';
import { api, type Pokemon } from './services/api';
import './App.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

type AppState = {
  error: string;
  isLoading: boolean;
  pokemons: Pokemon[];
};

class App extends Component<Record<string, never>, AppState> {
  state: AppState = {
    error: '',
    isLoading: false,
    pokemons: [],
  };

  componentDidMount() {
    const savedSearchTerm =
      localStorage.getItem(SEARCH_TERM_STORAGE_KEY) ?? '';

    this.loadPokemons(savedSearchTerm);
  }

  loadPokemons = async (searchTerm = '') => {
    localStorage.setItem(SEARCH_TERM_STORAGE_KEY, searchTerm);
    this.setState({ error: '', isLoading: true });

    try {
      const pokemons = await api.getPokemons(searchTerm);

      this.setState({ pokemons });
    } catch {
      this.setState({ error: 'ошібка загрузкі' });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { error, isLoading, pokemons } = this.state;

    return (
      <div className="page">
        <Header />
        <main className="application-page">
          <SearchSection onSearch={this.loadPokemons} />
          <ResultsSection
            error={error}
            isLoading={isLoading}
            pokemons={pokemons}
          />
        </main>
        <Footer />
      </div>
    );
  }
}

export default App;
