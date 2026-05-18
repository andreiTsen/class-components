import type { ReactNode } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

type PageLayoutProps = {
  children: ReactNode;
};

function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="page">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default PageLayout;
