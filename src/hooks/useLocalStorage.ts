import { useCallback, useEffect, useState } from 'react';

function useLocalStorage(
  key: string,
  initialValue = ''
): [string, (nextValue: string) => void] {
  const [value, setValue] = useState(
    () => localStorage.getItem(key) ?? initialValue
  );

  useEffect(() => {
    if (localStorage.getItem(key) !== value) {
      localStorage.setItem(key, value);
    }
  }, [key, value]);

  const updateValue = useCallback((nextValue: string) => {
    setValue(nextValue);
  }, []);

  return [value, updateValue];
}

export default useLocalStorage;
