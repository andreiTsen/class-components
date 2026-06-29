import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import loadingImage from '../../assets/loading_circles_blue_gradient.jpg';
import './LoadingIndicator.css';

const loadingImageData: StaticImageData = loadingImage;

type LoadingIndicatorProperties = {
  label?: string;
};

function LoadingIndicator({ label }: LoadingIndicatorProperties) {
  const t = useTranslations('Loading');

  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      <Image src={loadingImageData} alt="" width={42} height={42} />
      <span>{label ?? t('default')}</span>
    </div>
  );
}

export default LoadingIndicator;
