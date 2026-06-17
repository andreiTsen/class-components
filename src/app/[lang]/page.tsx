import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import Home from '../../pages-components/Home';

type PageProperties = {
  params: Promise<{
    lang: string;
  }>;
};

export default async function Page({ params }: PageProperties) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
