import { parsePositiveInteger } from '../utils/parsePositiveInteger';

const DEFAULT_API_CACHE_TTL_SECONDS = 60;

export const apiCacheTtlSeconds =
  parsePositiveInteger(process.env.NEXT_PUBLIC_API_CACHE_TTL_SECONDS) ??
  DEFAULT_API_CACHE_TTL_SECONDS;
