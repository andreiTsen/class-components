import { useState, type ChangeEvent, type SyntheticEvent } from 'react';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

type SearchSectionProps = {
  onSearch: (searchTerm: string) => void;
};

function SearchSection({ onSearch }: SearchSectionProps) {
  const [searchTerm, setSearchTerm] = useState(
    () => localStorage.getItem(SEARCH_TERM_STORAGE_KEY) ?? ''
  );

  const handleSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSearchTerm = searchTerm.trim();

    setSearchTerm(normalizedSearchTerm);
    onSearch(normalizedSearchTerm);
  };

  return (
    <section className="search-section" aria-labelledby="search-title">
      <h1 id="search-title">Pokemon Search</h1>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Search pokemons"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <button type="submit">Search</button>
      </form>
    </section>
  );
}

export default SearchSection;
