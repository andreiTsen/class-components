import loadingImage from '../assets/loading_circles_blue_gradient.jpg';

type LoadingIndicatorProps = {
  label?: string;
};

function LoadingIndicator({ label = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      <img src={loadingImage} alt="" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingIndicator;
