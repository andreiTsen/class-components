import { Route, Routes } from 'react-router';
import App from './App';
import PokemonDetailsPanel from './components/PokemonDetailsPanel';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="details/:pokemonId" element={<PokemonDetailsPanel />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
