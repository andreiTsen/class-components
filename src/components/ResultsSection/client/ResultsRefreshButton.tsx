'use client';

import { useRouter } from '../../../i18n/navigation';

type ResultsRefreshButtonProperties = {
  disabled?: boolean;
  label: string;
  onRefresh?: () => void;
};

function ResultsRefreshButton({
  disabled = false,
  label,
  onRefresh,
}: ResultsRefreshButtonProperties) {
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(): void => {
        if (onRefresh) {
          onRefresh();

          return;
        }

        router.refresh();
      }}
    >
      {label}
    </button>
  );
}

export default ResultsRefreshButton;
