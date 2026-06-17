'use client';

import { usePathname } from 'next/navigation';
import PokemonDetails from './components/PokemonDetails/PokemonDetails';
import { parsePositiveInteger } from './utils/parsePositiveInteger';
import About from './pages-components/About';
import Home from './pages-components/Home';
import Page404 from './pages-components/Page404';

function App() {
  const pathname = usePathname();
  const selectedPokemonId = /^\/details\/(\d+)$/.exec(pathname)?.[1];

  if (pathname === '/') {
    return <Home />;
  }

  if (pathname === '/about') {
    return <About />;
  }

  if (
    selectedPokemonId !== undefined &&
    parsePositiveInteger(selectedPokemonId)
  ) {
    return <Home details={<PokemonDetails pokemonId={selectedPokemonId} />} />;
  }

  return <Page404 />;
}

export default App;
