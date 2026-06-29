'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname } from '../../i18n/navigation';
import { getAppLocale } from '../../i18n/pathname';
import type { Pokemon } from '../../types';
import { parsePositiveInteger } from '../../utils/parsePositiveInteger';
import SelectedPokemonCheckbox from './client/SelectedPokemonCheckbox';

type PokemonResultItemProperties = {
  pokemon: Pokemon;
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

const getSelectedPokemonId = (pathname: string): number | null => {
  const detailsMatch = /^\/details\/([^/]+)$/.exec(pathname);

  return detailsMatch ? parsePositiveInteger(detailsMatch[1]) : null;
};

function PokemonResultItem({ pokemon }: PokemonResultItemProperties) {
  const locale = getAppLocale(useLocale());
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const t = useTranslations('Results');
  const selectedPokemonId = getSelectedPokemonId(pathname);
  const isSelected = selectedPokemonId === pokemon.id;
  const search = searchParameters.toString();
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
