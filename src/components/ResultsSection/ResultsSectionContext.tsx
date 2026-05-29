import { createContext, useContext } from 'react';
import type { Pokemon } from '../../types';

type ResultsSectionContextValue = {
  onPokemonSelectionChange: (pokemon: Pokemon, isSelected: boolean) => void;
  onPokemonSelect: (pokemonId: number) => void;
  selectedPokemonId: number | null;
  selectedPokemonIds: number[];
};

export const ResultsSectionContext =
  createContext<ResultsSectionContextValue | null>(null);

export const useResultsSectionContext = (): ResultsSectionContextValue => {
  const context = useContext(ResultsSectionContext);

  if (context === null) {
    throw new Error(
      'useResultsSectionContext must be used inside ResultsSectionContext.Provider.'
    );
  }

  return context;
};
