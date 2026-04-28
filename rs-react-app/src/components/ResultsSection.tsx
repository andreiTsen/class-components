import { Component } from 'react';
import type { Pokemon } from '../services/api';

type ResultsSectionProps = {
  error: string;
  isLoading: boolean;
  pokemons: Pokemon[];
};

class ResultsSection extends Component<ResultsSectionProps> {
  render() {
    const { error, isLoading, pokemons } = this.props;

    return (
      <section className="results-section" aria-labelledby="results-title">
        <div>
          <h2 id="results-title">Pokemons Results</h2>
          <p>Submitted Pokemon</p>
        </div>

        {isLoading && <p className="status-message">Loading...</p>}
        {error && <p className="status-message status-message-error">{error}</p>}
        {!isLoading && !error && pokemons.length === 0 && (
          <p className="status-message">No pokemons found.</p>
        )}

        <div className="result-list">
          {pokemons.map((pokemon) => (
            <article className="result-item" key={pokemon.id}>
              <div className="pokemon-info">
                {pokemon.imageUrl && (
                  <img src={pokemon.imageUrl} alt={`${pokemon.name} image`} />
                )}
                <div>
                  <h3>{pokemon.name}</h3>
                  <p>{pokemon.description}</p>
                </div>
              </div>
              <strong>#{pokemon.id}</strong>
            </article>
          ))}
        </div>
      </section>
    );
  }
}

export default ResultsSection;
