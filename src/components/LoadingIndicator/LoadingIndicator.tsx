import { useTranslations } from 'next-intl';
import loadingImage from '../../assets/loading_circles_blue_gradient.jpg';
import './LoadingIndicator.css';

type LoadingIndicatorProperties = {
  label?: string;
};

function LoadingIndicator({ label }: LoadingIndicatorProperties) {
  const t = useTranslations('Loading');

  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      <img src={loadingImage.src} alt="" />
      <span>{label ?? t('default')}</span>
    </div>
  );
}

export default LoadingIndicator;
