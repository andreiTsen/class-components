import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import { getPokemonById } from '../../services/pokemonService';
import type { Pokemon } from '../../types';
import '../StatusMessage.css';
import './PokemonDetails.css';

function PokemonDetails() {
  const { pokemonId } = useParams();
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  const handleCloseDetails = (): void => {
    const search = searchParameters.toString();

    void navigate({
      pathname: '/',
      search: search ? `?${search}` : '',
    });
  };

  useEffect(() => {
    let ignore = false;

    const loadPokemonDetails = async (): Promise<void> => {
      setError('');
      setIsLoading(true);
      setPokemon(null);

      if (!pokemonId) {
        setError('Failed to load Pokemon data.');
        setIsLoading(false);
        return;
      }

      try {
        const pokemonDetails = await getPokemonById(pokemonId);

        if (!ignore) {
          setPokemon(pokemonDetails);
          setIsLoading(false);
        }
      } catch {
        if (!ignore) {
          setError('Failed to load Pokemon data.');
          setIsLoading(false);
        }
      }
    };

    void loadPokemonDetails();

    return (): void => {
      ignore = true;
    };
  }, [pokemonId]);

  return (
    <aside className="details-pane" aria-label="Pokemon details">
      <button
        className="details-close-button"
        type="button"
        onClick={handleCloseDetails}
      >
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
