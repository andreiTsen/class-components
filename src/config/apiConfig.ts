import { parsePositiveInteger } from '../utils/parsePositiveInteger';

const DEFAULT_API_CACHE_TTL_SECONDS = Number('60');

export const apiCacheTtlSeconds =
  parsePositiveInteger(import.meta.env.VITE_API_CACHE_TTL_SECONDS) ??
  DEFAULT_API_CACHE_TTL_SECONDS;
