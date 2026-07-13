import { useEffect, useRef } from 'react';
import styles from './YandexMap.module.css';

const MAP_SCRIPT_SRC =
  'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A3271854cc32f28ece92a708a0d6ed2a5aca19c4f85608b8da95dd56852b00d28&width=100%&height=280&lang=ru_RU&scroll=true';

export function YandexMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.src = MAP_SCRIPT_SRC;
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.map}
      aria-label="Карта клиники на Яндекс Картах"
    />
  );
}
