import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { FetchWithBaseQuery } from './pokemonBaseQuery';

export type QueryError = FetchBaseQueryError;
type TypeGuard<T> = (value: unknown) => value is T;

export const getQueryError = (message: string): QueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

export const isQueryError = (value: unknown): value is QueryError => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'error' in value
  );
};

export const getValidatedQueryData = async <T>(
  fetchWithBaseQuery: FetchWithBaseQuery,
  path: string,
  isExpectedResponse: TypeGuard<T>,
  errorMessage: string
): Promise<T | QueryError> => {
  const response = await fetchWithBaseQuery(path);

  if (response.error || !isExpectedResponse(response.data)) {
    return getQueryError(errorMessage);
  }

  return response.data;
};
