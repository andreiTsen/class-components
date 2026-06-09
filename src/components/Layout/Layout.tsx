import type { ReactNode } from 'react';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import './Layout.css';

type LayoutProperties = {
  children: ReactNode;
};

function Layout({ children }: LayoutProperties) {
  return (
    <div className="page">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default Layout;
