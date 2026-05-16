import { Route, Routes } from 'react-router';
import App from './App';
import PokemonDetailsPanel from './components/PokemonDetailsPanel';
import AboutPage from './pages/AboutPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="details/:pokemonId" element={<PokemonDetailsPanel />} />
      </Route>
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}

export default AppRoutes;
