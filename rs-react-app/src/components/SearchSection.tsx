import { Component } from 'react';

class SearchSection extends Component {
  render() {
    return (
      <section className="search-section" aria-labelledby="search-title">
        <h1 id="search-title">Pokemon Search</h1>
        <form className="search-form">
          <input type="search" placeholder="Search pokemons" />
          <button type="submit">Search</button>
        </form>
      </section>
    );
  }
}

export default SearchSection;
