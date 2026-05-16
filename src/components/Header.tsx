import { Link } from 'react-router';

function Header() {
  return (
    <header className="page-header">
      <h1>Покемон суперсущество</h1>
      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
}

export default Header;
