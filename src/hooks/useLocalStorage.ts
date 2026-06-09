import { useEffect, useState } from 'react';

const normalizeStorageValue = (value: string): string => {
  return value.trim();
};

const getStoredValue = (key: string, initialValue: string): string => {
  try {
    return normalizeStorageValue(localStorage.getItem(key) ?? initialValue);
  } catch {
    return normalizeStorageValue(initialValue);
  }
};

const setStoredValue = (key: string, value: string): void => {
  try {
    if (localStorage.getItem(key) !== value) {
      localStorage.setItem(key, value);
    }
  } catch {
    return;
  }
};

function useLocalStorage(
  key: string,
  initialValue = ''
): [string, (nextValue: string) => void] {
  const [value, setValue] = useState(() => getStoredValue(key, initialValue));

  useEffect(() => {
    setStoredValue(key, value);
  }, [key, value]);

  const updateValue = (nextValue: string): void => {
    setValue(normalizeStorageValue(nextValue));
  };

  return [value, updateValue];
}

export default useLocalStorage;
