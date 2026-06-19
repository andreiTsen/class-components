'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../i18n/navigation';
import { getAppLocale } from '../../i18n/pathname';

type PokemonDetailsActionsProperties = {
  closeLabel: string;
  refreshLabel: string;
};

function PokemonDetailsActions({
  closeLabel,
  refreshLabel,
}: PokemonDetailsActionsProperties) {
  const router = useRouter();
  const locale = getAppLocale(useLocale());
  const searchParameters = useSearchParams();

  const closeDetails = (): void => {
    const search = searchParameters.toString();

    router.push(search ? `/?${search}` : '/', { locale, scroll: false });
  };

  return (
    <>
      <button
        className="details-close-button"
        type="button"
        onClick={closeDetails}
      >
        {closeLabel}
      </button>
      <button
        type="button"
        onClick={(): void => {
          router.refresh();
        }}
      >
        {refreshLabel}
      </button>
    </>
  );
}

export default PokemonDetailsActions;
