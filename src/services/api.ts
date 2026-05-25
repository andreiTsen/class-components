import type {
  PokemonDetailsResponse,
  PokemonListResponse,
  PokemonSpeciesResponse,
} from '../types';
import {
  isPokemonDetailsResponse,
  isPokemonListResponse,
  isPokemonSpeciesResponse,
} from '../utils/typeGuards';
import { fetchValidatedResponse } from './fetchValidatedResponse';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (
  limit: number,
  offset: number
): Promise<PokemonListResponse> => {
  const queryParameters: URLSearchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  return fetchValidatedResponse(
    `${API_BASE_URL}/pokemon?${queryParameters}`,
    isPokemonListResponse,
    'Failed to load Pokemon list.'
  );
};

export const fetchPokemonDetails = (
  nameOrId: string | number
): Promise<PokemonDetailsResponse> => {
  return fetchValidatedResponse(
    `${API_BASE_URL}/pokemon/${String(nameOrId)}`,
    isPokemonDetailsResponse,
    'Failed to load Pokemon.'
  );
};

export const fetchPokemonSpecies = (
  speciesName: string
): Promise<PokemonSpeciesResponse> => {
  return fetchValidatedResponse(
    `${API_BASE_URL}/pokemon-species/${speciesName}`,
    isPokemonSpeciesResponse,
    'Failed to load Pokemon description.'
  );
};
