import loadingImage from '../assets/loading_circles_blue_gradient.jpg';
import type { Pokemon } from '../services/api';

type ResultsSectionProps = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  pokemons: Pokemon[];
  totalPages: number;
};

function ResultsSection({
  currentPage,
  error,
  isLoading,
  onPageChange,
  pokemons,
  totalPages,
}: ResultsSectionProps) {
  const showPagination =
    !isLoading && !error && pokemons.length > 0 && totalPages > 1;

  return (
    <section className="results-section" aria-labelledby="results-title">
      <div>
        <h2 id="results-title">Pokemons Results</h2>
        <p>Submitted Pokemon</p>
      </div>

      {isLoading && (
        <div className="loading-indicator" role="status" aria-live="polite">
          <img src={loadingImage} alt="" />
          <span>Loading...</span>
        </div>
      )}
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

      {showPagination && (
        <nav className="pagination" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span aria-current="page">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}

export default ResultsSection;
