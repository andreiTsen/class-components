import { Route, Routes } from 'react-router';
import PokemonDetails from './components/PokemonDetails';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import Page404 from './pages/Page404';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}>
        <Route path="details/:pokemonId" element={<PokemonDetails />} />
      </Route>
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}

export default AppRoutes;
