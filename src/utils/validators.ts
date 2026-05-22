import type {
  PokemonDetailsResponse,
  PokemonListItem,
  PokemonListResponse,
  PokemonSpeciesResponse,
} from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isNamedResource = (value: unknown): value is { name: string } => {
  return isRecord(value) && typeof value.name === 'string';
};

const isPokemonListItem = (value: unknown): value is PokemonListItem => {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.url === 'string'
  );
};

const isPokemonListResponse = (
  value: unknown
): value is PokemonListResponse => {
  return (
    isRecord(value) &&
    typeof value.count === 'number' &&
    Array.isArray(value.results) &&
    value.results.every(isPokemonListItem)
  );
};

const isPokemonDetailsResponse = (
  value: unknown
): value is PokemonDetailsResponse => {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    isNamedResource(value.species) &&
    isRecord(value.sprites) &&
    (typeof value.sprites.front_default === 'string' ||
      value.sprites.front_default === null)
  );
};

const isPokemonSpeciesResponse = (
  value: unknown
): value is PokemonSpeciesResponse => {
  return (
    isRecord(value) &&
    Array.isArray(value.flavor_text_entries) &&
    value.flavor_text_entries.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.flavor_text === 'string' &&
        isNamedResource(entry.language)
    )
  );
};

export {
  isPokemonListResponse,
  isPokemonDetailsResponse,
  isPokemonSpeciesResponse,
};
