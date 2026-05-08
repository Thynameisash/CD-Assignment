import { useState, useEffect, useCallback, useContext, createContext, createElement } from 'react';

const STORAGE_KEY = 'carfinder_shortlist';

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

const ShortlistContext = createContext(null);

export function ShortlistProvider({ children }) {
  const [ids, setIds] = useState(readStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const add = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const remove = useCallback((id) => {
    setIds((prev) => prev.filter((i) => i !== id));
  }, []);

  const toggle = useCallback((id) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);

  const clear = useCallback(() => setIds([]), []);

  const value = { ids, count: ids.length, add, remove, toggle, has, clear };

  return createElement(ShortlistContext.Provider, { value }, children);
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error('useShortlist must be used within ShortlistProvider');
  return ctx;
}
