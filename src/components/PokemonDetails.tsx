import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import LoadingIndicator from './LoadingIndicator';
import { api, type Pokemon } from '../services/api';

type DetailsOutletContext = {
  onClose: () => void;
};

function PokemonDetails() {
  const { pokemonId } = useParams();
  const { onClose } = useOutletContext<DetailsOutletContext>();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadPokemonDetails = async () => {
      setError('');
      setIsLoading(true);
      setPokemon(null);

      try {
        const pokemonDetails = await api.getPokemonById(pokemonId);

        if (!ignore) {
          setPokemon(pokemonDetails);
        }
      } catch {
        if (!ignore) {
          setError('Failed to load Pokemon data.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadPokemonDetails();

    return () => {
      ignore = true;
    };
  }, [pokemonId]);

  return (
    <aside className="details-pane" aria-label="Pokemon details">
      <button className="details-close-button" type="button" onClick={onClose}>
        Close
      </button>

      {isLoading && <LoadingIndicator label="Loading details..." />}

      {error && <p className="status-message status-message-error">{error}</p>}

      {pokemon && !isLoading && !error && (
        <div className="details-content">
          {pokemon.imageUrl && (
            <img src={pokemon.imageUrl} alt={pokemon.name} />
          )}
          <div>
            <h2>{pokemon.name}</h2>
            <strong>#{pokemon.id}</strong>
          </div>
          <p>{pokemon.description}</p>
        </div>
      )}
    </aside>
  );
}

export default PokemonDetails;
