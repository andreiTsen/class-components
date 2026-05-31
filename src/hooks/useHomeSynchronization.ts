import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import {
  clearSelectedPokemon,
  selectPokemon,
} from '../store/selectedPokemonSlice';
import { useAppDispatch } from '../store/hooks';
import { parsePositiveInteger } from '../utils/parsePositiveInteger';

type UseHomeSynchronizationProperties = {
  loadPage: (page: number, searchTerm: string) => Promise<void>;
  selectedPokemonId: number | null;
  storedSearchTerm: string;
  storedSelectedPokemonId: number | null;
};

const useHomeSynchronization = ({
  loadPage,
  selectedPokemonId,
  storedSearchTerm,
  storedSelectedPokemonId,
}: UseHomeSynchronizationProperties): void => {
  const dispatch = useAppDispatch();
  const [searchParameters, setSearchParameters] = useSearchParams();

  useEffect(() => {
    const currentPageFromUrl =
      parsePositiveInteger(searchParameters.get('page')) ?? 1;

    if (searchParameters.get('page') !== String(currentPageFromUrl)) {
      setSearchParameters(
        (currentSearchParameters) => {
          const nextSearchParameters = new URLSearchParams(
            currentSearchParameters
          );
          nextSearchParameters.set('page', String(currentPageFromUrl));
          return nextSearchParameters;
        },
        { replace: true }
      );
      return;
    }

    void loadPage(currentPageFromUrl, storedSearchTerm);
  }, [loadPage, searchParameters, setSearchParameters, storedSearchTerm]);

  useEffect(() => {
    if (selectedPokemonId === null) {
      if (storedSelectedPokemonId !== null) {
        dispatch(clearSelectedPokemon());
      }
      return;
    }

    if (storedSelectedPokemonId !== selectedPokemonId) {
      dispatch(selectPokemon(selectedPokemonId));
    }
  }, [dispatch, selectedPokemonId, storedSelectedPokemonId]);
};

export default useHomeSynchronization;
