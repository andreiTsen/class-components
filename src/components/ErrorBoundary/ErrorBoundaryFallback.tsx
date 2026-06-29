import { useTranslations } from 'next-intl';

type ErrorBoundaryFallbackProperties = {
  onReset: () => void;
};

function ErrorBoundaryFallback({ onReset }: ErrorBoundaryFallbackProperties) {
  const t = useTranslations('ErrorBoundary');

  return (
    <section className="error-boundary">
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <button type="button" onClick={onReset}>
        {t('reset')}
      </button>
    </section>
  );
}

export default ErrorBoundaryFallback;
