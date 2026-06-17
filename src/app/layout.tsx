import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from './providers';
import '../App.css';

export const metadata: Metadata = {
  title: 'Pokemon super monster',
  description: 'Pokemon search application',
};

type RootLayoutProperties = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProperties) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
