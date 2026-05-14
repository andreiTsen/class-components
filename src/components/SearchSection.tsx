import { Component } from 'react';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

type SearchSectionProps = {
  onSearch: (searchTerm: string) => void;
};

type SearchSectionState = {
  searchTerm: string;
};

class SearchSection extends Component<SearchSectionProps, SearchSectionState> {
  state: SearchSectionState = {
    searchTerm: '',
  };

  componentDidMount() {
    const savedSearchTerm =
      localStorage.getItem(SEARCH_TERM_STORAGE_KEY) ?? '';

    this.setState({ searchTerm: savedSearchTerm });
  }

  handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSearchTerm = this.state.searchTerm.trim();

    this.setState({ searchTerm: normalizedSearchTerm });
    this.props.onSearch(normalizedSearchTerm);
  };

  render() {
    const { searchTerm } = this.state;

    return (
      <section className="search-section" aria-labelledby="search-title">
        <h1 id="search-title">Pokemon Search</h1>
        <form className="search-form" onSubmit={this.handleSubmit}>
          <input
            type="search"
            placeholder="Search pokemons"
            value={searchTerm}
            onChange={this.handleSearchTermChange}
          />
          <button type="submit">Search</button>
        </form>
      </section>
    );
  }
}

export default SearchSection;
