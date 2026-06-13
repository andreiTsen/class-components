import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import './SearchSection.css';

type SearchSectionProperties = {
  handleSearch: (searchTerm: string) => void;
  storedSearchTerm?: string;
};

function SearchSection({
  handleSearch,
  storedSearchTerm = '',
}: SearchSectionProperties) {
  const [searchTerm, setSearchTerm] = useState(storedSearchTerm);

  const handleSearchTermChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const normalizedSearchTerm: string = searchTerm.trim();

    setSearchTerm(normalizedSearchTerm);
    handleSearch(normalizedSearchTerm);
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
