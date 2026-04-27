import { Component } from 'react';

class ResultsSection extends Component {
  render() {
    return (
      <section className="results-section" aria-labelledby="results-title">
        <div>
          <h2 id="results-title">Pokemons Results</h2>
          <p>Submitted Pokemon</p>
        </div>
        <div className="result-list">
          <article className="result-item">
            <span>Pokemon 001</span>
            <strong>Status</strong>
          </article>
          <article className="result-item">
            <span>Pokemon 002</span>
            <strong>Status</strong>
          </article>
        </div>
      </section>
    );
  }
}

export default ResultsSection;
