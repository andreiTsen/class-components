import { Component } from 'react';

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

  handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.props.onSearch(this.state.searchTerm);
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
