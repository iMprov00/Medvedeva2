import { useEffect, useRef } from 'react';
import { MEDFLEX_USER_ID } from '../../content/medflex';
import styles from './MedflexWidget.module.css';

const BASE_URL = 'https://booking.medflex.ru';

export function MedflexWidget() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const src = `${BASE_URL}/prices/?user=${MEDFLEX_USER_ID}&originUrl=${encodeURIComponent(window.location.origin)}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function handleMessage(event: MessageEvent) {
      if (typeof event.data === 'number' && event.data > 0) {
        iframe!.style.minHeight = `${event.data}px`;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <section className="section sectionToneWhite">
      <div className="container">
        <div className={styles.wrapper}>
          <iframe
            ref={iframeRef}
            title="Прайс-лист клиники"
            src={src}
            className={styles.iframe}
          />
        </div>
      </div>
    </section>
  );
}
