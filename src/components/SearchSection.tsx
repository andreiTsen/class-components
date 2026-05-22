import { useState, type ChangeEvent, type SyntheticEvent } from 'react';

type SearchSectionProperties = {
  initialSearchTerm?: string;
  onSearch: (searchTerm: string) => void;
};

function SearchSection({
  initialSearchTerm = '',
  onSearch,
}: SearchSectionProperties) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

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
