import { useOutletContext, useParams } from 'react-router';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import { useGetPokemonByIdQuery } from '../../services/pokemonApi';
import '../StatusMessage.css';
import './PokemonDetails.css';

type DetailsOutletContext = {
  onClose: () => void;
};

function PokemonDetails() {
  const { pokemonId } = useParams();
  const { onClose } = useOutletContext<DetailsOutletContext>();
  const {
    data: pokemon,
    isError,
    isFetching,
  } = useGetPokemonByIdQuery(pokemonId ?? '', { skip: !pokemonId });
  const shouldShowLoader = isFetching || (!pokemon && !isError);

  return (
    <aside className="details-pane" aria-label="Pokemon details">
      <button className="details-close-button" type="button" onClick={onClose}>
        Close
      </button>

      {shouldShowLoader && <LoadingIndicator label="Loading details..." />}

      {isError && (
        <p className="status-message status-message-error">
          Failed to load Pokemon data.
        </p>
      )}

      {pokemon && !shouldShowLoader && !isError && (
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
