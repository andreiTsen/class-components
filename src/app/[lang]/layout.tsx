import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import { routing } from '../../i18n/routing';
import Providers from '../providers';
import '../../App.css';
import '../../components/Layout/Layout.css';

type LocaleLayoutProperties = {
  children: ReactNode;
  params: Promise<{
    lang: string;
  }>;
};

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProperties, 'params'>): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProperties) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  setRequestLocale(lang);

  return (
    <html lang={lang}>
      <body>
        <NextIntlClientProvider>
          <Suspense>
            <Providers>
              <div className="page">
                <Header />
                {children}
                <Footer />
              </div>
            </Providers>
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
