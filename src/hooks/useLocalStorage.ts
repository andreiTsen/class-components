import { useCallback, useEffect, useState } from 'react';

function useLocalStorage(
  key: string,
  initialValue = ''
): [string, (nextValue: string) => void] {
  const [value, setValue] = useState(
    () => localStorage.getItem(key) ?? initialValue
  );

  useEffect(() => {
    const currentValue: string | null = localStorage.getItem(key);

    if (currentValue !== value) {
      localStorage.setItem(key, value);
    }
  }, [key, value]);

  const updateValue: (nextValue: string) => void = useCallback(
    (nextValue: string): void => {
      setValue(nextValue);
    },
    []
  );

  return [value, updateValue];
}

export default useLocalStorage;
