import { Component } from 'react';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import './App.css';

class App extends Component {
  render() {
    return (
      <main className="application-page">
        <SearchSection />
        <ResultsSection />
      </main>
    );
  }
}

export default App;
