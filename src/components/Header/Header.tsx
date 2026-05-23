import { Link } from 'react-router';
import './Header.css';

function Header() {
  return (
    <header className="page-header" aria-label="Page header">
      <h1>Pokemon super monster</h1>
      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
}

export default Header;
