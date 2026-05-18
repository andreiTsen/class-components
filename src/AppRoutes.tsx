import { Route, Routes } from 'react-router';
import App from './App';
import PokemonDetails from './components/PokemonDetails';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import Page404 from './pages/Page404';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<HomePage />}>
          <Route path="details/:pokemonId" element={<PokemonDetails />} />
        </Route>
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Page404 />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
