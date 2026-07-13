import { useEffect, useRef, useState } from 'react';

export function useElementHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      setHeight(element.getBoundingClientRect().height);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, height };
}
