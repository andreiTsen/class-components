import { setRequestLocale } from 'next-intl/server';
import About from '../../../pages-components/About';

type AboutPageProperties = {
  params: Promise<{
    lang: string;
  }>;
};

export default async function AboutPage({ params }: AboutPageProperties) {
  const { lang } = await params;
  setRequestLocale(lang);

  return <About />;
}
