import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import PokemonDetails from '../../../../components/PokemonDetails/PokemonDetails';
import Home from '../../../../pages-components/Home';

type DetailsPageProperties = {
  params: Promise<{
    lang: string;
    pokemonId: string;
  }>;
};

export default async function DetailsPage({ params }: DetailsPageProperties) {
  const { lang, pokemonId } = await params;
  setRequestLocale(lang);

  return (
    <Suspense>
      <Home details={<PokemonDetails pokemonId={pokemonId} />} />
    </Suspense>
  );
}
