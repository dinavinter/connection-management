import { useState } from 'react';

export function useArray<T>(_key: string): [T[], (item: T) => void] {
  const [items, setItems] = useState<T[]>([]);

  const push = (item: T) => {
    setItems([...items, item]);
  };

  return [items, push];
}
