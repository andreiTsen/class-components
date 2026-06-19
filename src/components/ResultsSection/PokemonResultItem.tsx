import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '../../i18n/navigation';
import { getAppLocale } from '../../i18n/pathname';
import type { Pokemon } from '../../types';
import SelectedPokemonCheckbox from './client/SelectedPokemonCheckbox';

type PokemonResultItemProperties = {
  currentSearchParameters: URLSearchParams;
  pokemon: Pokemon;
  selectedPokemonId?: number | null;
};

type PokemonImageProperties = {
  pokemon: Pokemon;
};

function PokemonImage({ pokemon }: PokemonImageProperties) {
  if (!pokemon.imageUrl) {
    return null;
  }

  return (
    <Image src={pokemon.imageUrl} alt={pokemon.name} width={40} height={40} />
  );
}

function PokemonResultItem({
  currentSearchParameters,
  pokemon,
  selectedPokemonId = null,
}: PokemonResultItemProperties) {
  const locale = getAppLocale(useLocale());
  const t = useTranslations('Results');
  const isSelected = selectedPokemonId === pokemon.id;
  const search = currentSearchParameters.toString();
  const href = search
    ? `/details/${String(pokemon.id)}?${search}`
    : `/details/${String(pokemon.id)}`;

  return (
    <div className="result-list-item">
      <SelectedPokemonCheckbox
        ariaLabel={t('selectPokemon', { name: pokemon.name })}
        pokemon={pokemon}
      />
      <Link
        className="result-item"
        href={href}
        locale={locale}
        role="article"
        scroll={false}
        aria-current={isSelected ? 'true' : undefined}
        aria-label={pokemon.name}
      >
        <div className="pokemon-info">
          <PokemonImage pokemon={pokemon} />
          <div>
            <h3>{pokemon.name}</h3>
            <p>{pokemon.description}</p>
          </div>
        </div>
        <strong>#{pokemon.id}</strong>
      </Link>
    </div>
  );
}

export default PokemonResultItem;
