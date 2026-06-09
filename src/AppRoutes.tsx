import { Route, Routes } from 'react-router';
import PokemonDetails from './components/PokemonDetails/PokemonDetails';
import About from './pages/About';
import Home from './pages/Home';
import Page404 from './pages/Page404';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="details/:pokemonId" element={<PokemonDetails />} />
      </Route>
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}

export default AppRoutes;
