import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import loadingImage from '../assets/loading_circles_blue_gradient.jpg';
import { api, type Pokemon } from '../services/api';

type DetailsOutletContext = {
  onClose: () => void;
};

function PokemonDetailsPanel() {
  const { pokemonId } = useParams();
  const { onClose } = useOutletContext<DetailsOutletContext>();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    const id = Number(pokemonId);
    let ignore = false;

    if (!Number.isInteger(id) || id <= 0) {
      queueMicrotask(() => {
        if (!ignore) {
          setError('Не удалось загрузить данные покемона.');
          setIsLoading(false);
        }
      });
      return;
    }

    void Promise.resolve()
      .then(() => {
        if (!ignore) {
          setError('');
          setIsLoading(true);
          setPokemon(null);
        }

        return api.getPokemonById(id);
      })
      .then((pokemonDetails) => {
        if (!ignore) {
          setPokemon(pokemonDetails);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Не удалось загрузить данные покемона.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [pokemonId]);

  return (
    <aside
      className="details-pane"
      aria-label="Pokemon details"
    >
      <button className="details-close-button" type="button" onClick={onClose}>
        Close
      </button>

      {isLoading && (
        <div className="loading-indicator" role="status" aria-live="polite">
          <img src={loadingImage} alt="" />
          <span>Loading details...</span>
        </div>
      )}

      {error && <p className="status-message status-message-error">{error}</p>}

      {pokemon && !isLoading && !error && (
        <div className="details-content">
          {pokemon.imageUrl && (
            <img src={pokemon.imageUrl} alt={`${pokemon.name} image`} />
          )}
          <div>
            <h2 id="details-title">{pokemon.name}</h2>
            <strong>#{pokemon.id}</strong>
          </div>
          <p>{pokemon.description}</p>
        </div>
      )}
    </aside>
  );
}

export default PokemonDetailsPanel;
