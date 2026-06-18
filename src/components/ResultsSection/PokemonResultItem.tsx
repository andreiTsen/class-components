import type { KeyboardEvent, MouseEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '../../i18n/navigation';
import { getAppLocale, getPathnameWithoutLocale } from '../../i18n/pathname';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPokemonSelection } from '../../store/selectedPokemonSlice';
import type { Pokemon } from '../../types';
import { parsePositiveInteger } from '../../utils/parsePositiveInteger';

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

function PokemonResultItem({ pokemon }: PokemonResultItemProperties) {
  const dispatch = useAppDispatch();
  const locale = getAppLocale(useLocale());
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Results');
  const searchParameters = useSearchParams();
  const search = searchParameters.toString();
  const selectedPokemonId = parsePositiveInteger(
    /^\/details\/(\d+)$/.exec(getPathnameWithoutLocale(pathname))?.[1]
  );
  const selectedPokemonIds = useAppSelector(
    (state) => state.selectedPokemon.selectedPokemonIds
  );
  const isChecked = selectedPokemonIds.includes(pokemon.id);
  const isSelected = selectedPokemonId === pokemon.id;

  const openPokemonDetails = (): void => {
    const detailsPathname = `/details/${String(pokemon.id)}`;

    router.push(search ? `${detailsPathname}?${search}` : detailsPathname, {
      locale,
    });
  };

  return (
    <article
      className="result-item"
      tabIndex={0}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={pokemon.name}
      onClick={(event: MouseEvent<HTMLElement>): void => {
        event.stopPropagation();
        openPokemonDetails();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLElement>): void => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPokemonDetails();
        }
      }}
    >
      <label
        className="result-checkbox"
        onClick={(event: MouseEvent<HTMLLabelElement>): void => {
          event.stopPropagation();
        }}
      >
        <input
          type="checkbox"
          aria-label={t('selectPokemon', { name: pokemon.name })}
          checked={isChecked}
          onChange={(event): void => {
            dispatch(
              setPokemonSelection({
                isSelected: event.target.checked,
                pokemon,
              })
            );
          }}
          onKeyDown={(event): void => {
            event.stopPropagation();
          }}
        />
      </label>
      <div className="pokemon-info">
        <PokemonImage pokemon={pokemon} />
        <div>
          <h3>{pokemon.name}</h3>
          <p>{pokemon.description}</p>
        </div>
      </div>
      <strong>#{pokemon.id}</strong>
    </article>
  );
}

export default PokemonResultItem;
