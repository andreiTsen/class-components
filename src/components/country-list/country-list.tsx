import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UIEvent } from 'react';
import type { Country } from '../../types';
import { CountryCard } from '../country-card/country-card';
import { getPopulationForYear, createYearDataMap } from '../../utils/data-transformers';

import styles from './country-list.module.css';

type CountryListProps = {
  countries: Country[];
  searchQuery: string;
  selectedColumns: string[];
  selectedRegion: string;
  selectedYear: number;
  sortField: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
};

const LIST_HEIGHT = 700;
const OVERSCAN_COUNT = 4;

export const CountryList = memo(({
  countries,
  searchQuery,
  selectedColumns,
  selectedRegion,
  selectedYear,
  sortField,
  sortOrder,
}: CountryListProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const itemHeight = useMemo(() => 156 + selectedColumns.length * 35, [selectedColumns.length]);
  const searchQueryLower = useMemo(() => searchQuery.toLowerCase(), [searchQuery]);

  const filteredCountries = useMemo(() => {
    const countryRows = countries
      .filter((country) => {
        const matchesSearch = country.id.toLowerCase().includes(searchQueryLower);
        const matchesRegion =
          !selectedRegion || country.data.some((yearData) => yearData.region === selectedRegion);

        return matchesSearch && matchesRegion;
      })
      .map((country) => ({
        country,
        population: getPopulationForYear(createYearDataMap(country.data), selectedYear) || 0,
      }));

    countryRows.sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc'
          ? a.country.id.localeCompare(b.country.id)
          : b.country.id.localeCompare(a.country.id);
      }

      return sortOrder === 'asc' ? a.population - b.population : b.population - a.population;
    });

    return countryRows.map(({ country }) => country);
  }, [countries, searchQueryLower, selectedRegion, selectedYear, sortField, sortOrder]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [itemHeight, searchQueryLower, selectedRegion, selectedYear, sortField, sortOrder]);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const visibleRange = useMemo(() => {
    const totalHeight = filteredCountries.length * itemHeight;
    const maxScrollTop = Math.max(0, totalHeight - LIST_HEIGHT);
    const clampedScrollTop = Math.min(scrollTop, maxScrollTop);
    const startIndex = Math.max(0, Math.floor(clampedScrollTop / itemHeight) - OVERSCAN_COUNT);
    const visibleCount = Math.ceil(LIST_HEIGHT / itemHeight) + OVERSCAN_COUNT * 2;
    const endIndex = Math.min(filteredCountries.length, startIndex + visibleCount);

    return { endIndex, startIndex };
  }, [filteredCountries.length, itemHeight, scrollTop]);

  const visibleCountries = useMemo(
    () => filteredCountries.slice(visibleRange.startIndex, visibleRange.endIndex),
    [filteredCountries, visibleRange]
  );

  return (
    <div
      ref={listRef}
      className={styles.countryList}
      style={{ height: LIST_HEIGHT }}
      onScroll={handleScroll}
    >
      <div
        className={styles.virtualSpacer}
        style={{ height: filteredCountries.length * itemHeight }}
      >
        {visibleCountries.map((country, index) => {
          const countryIndex = visibleRange.startIndex + index;

          return (
            <div
              key={country.id}
              className={styles.virtualItem}
              style={{
                height: itemHeight,
                transform: `translateY(${countryIndex * itemHeight}px)`,
              }}
            >
              <CountryCard
                country={country}
                selectedYear={selectedYear}
                selectedColumns={selectedColumns}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
