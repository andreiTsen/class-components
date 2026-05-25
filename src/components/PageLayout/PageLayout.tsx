import type { ReactNode } from 'react';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import './PageLayout.css';

type PageLayoutProperties = {
  children: ReactNode;
};

function PageLayout({ children }: PageLayoutProperties) {
  return (
    <div className="page">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default PageLayout;
