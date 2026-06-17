import { Suspense } from 'react';
import PokemonDetails from '../../../components/PokemonDetails/PokemonDetails';
import Home from '../../../pages-components/Home';

type DetailsPageProperties = {
  params: Promise<{
    pokemonId: string;
  }>;
};

export default async function DetailsPage({ params }: DetailsPageProperties) {
  const { pokemonId } = await params;

  return (
    <Suspense>
      <Home details={<PokemonDetails pokemonId={pokemonId} />} />
    </Suspense>
  );
}
