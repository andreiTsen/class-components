import { useCallback } from 'react';

function useLocalStorage() {
  const getItem = useCallback((key: string) => {
    return localStorage.getItem(key);
  }, []);

  const setItem = useCallback((key: string, value: string) => {
    localStorage.setItem(key, value);
  }, []);

  const removeItem = useCallback((key: string) => {
    localStorage.removeItem(key);
  }, []);

  const clear = useCallback(() => {
    localStorage.clear();
  }, []);

  return {
    clear,
    getItem,
    removeItem,
    setItem,
  };
}

export default useLocalStorage;
