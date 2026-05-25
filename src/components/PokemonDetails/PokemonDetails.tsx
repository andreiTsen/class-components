import { useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import { getPokemonById } from '../../services/pokemonService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loadSelectedPokemonFailure,
  loadSelectedPokemonStart,
  loadSelectedPokemonSuccess,
} from '../../store/selectedPokemonSlice';
import '../StatusMessage.css';
import './PokemonDetails.css';

type DetailsOutletContext = {
  onClose: () => void;
};

function PokemonDetails() {
  const { pokemonId } = useParams();
  const { onClose } = useOutletContext<DetailsOutletContext>();
  const dispatch = useAppDispatch();
  const { error, isLoading, pokemon } = useAppSelector(
    (state) => state.selectedPokemon
  );
  const shouldShowLoader = isLoading || (!pokemon && !error);

  useEffect(() => {
    let ignore = false;

    const loadPokemonDetails = async (): Promise<void> => {
      dispatch(loadSelectedPokemonStart());

      if (!pokemonId) {
        dispatch(loadSelectedPokemonFailure('Failed to load Pokemon data.'));
        return;
      }

      try {
        const pokemonDetails = await getPokemonById(pokemonId);

        if (!ignore) {
          dispatch(loadSelectedPokemonSuccess(pokemonDetails));
        }
      } catch {
        if (!ignore) {
          dispatch(loadSelectedPokemonFailure('Failed to load Pokemon data.'));
        }
      }
    };

    void loadPokemonDetails();

    return (): void => {
      ignore = true;
    };
  }, [dispatch, pokemonId]);

  return (
    <aside className="details-pane" aria-label="Pokemon details">
      <button className="details-close-button" type="button" onClick={onClose}>
        Close
      </button>

      {shouldShowLoader && <LoadingIndicator label="Loading details..." />}

      {error && <p className="status-message status-message-error">{error}</p>}

      {pokemon && !shouldShowLoader && !error && (
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
