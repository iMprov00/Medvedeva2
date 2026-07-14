import { useEffect, useState } from 'react';
import { PageHero } from '../components/ui/PageHero';
import { FeatureIcon } from '../components/ui/FeatureIcon';
import { docsHero, docsNote } from '../content/docs';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import { ContactsSection } from '../components/home/ContactsSection';
import { fetchDocuments } from '../api/cms';
import type { ClinicDocument } from '../types/cms';
import styles from './DocsPage.module.css';

export function DocsPage() {
  const [documents, setDocuments] = useState<ClinicDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDocuments()
      .then((items) => {
        if (!cancelled) setDocuments(items);
      })
      .catch(() => {
        if (!cancelled) setDocuments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHero title={docsHero.title} subtitle={docsHero.subtitle} />
      <section className="section sectionToneWhite">
        <div className="container">
          {loading ? (
            <p className={styles.cardText}>Загрузка документов...</p>
          ) : documents.length === 0 ? (
            <p className={styles.cardText}>Документы скоро появятся.</p>
          ) : (
            <div className={styles.grid}>
              {documents.map((doc) => (
                <article key={doc.id} className={styles.card}>
                  <FeatureIcon name="list" size={22} />
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{doc.title}</h2>
                    {doc.description && <p className={styles.cardText}>{doc.description}</p>}
                    <a
                      href={doc.fileUrl}
                      download={doc.originalFilename || undefined}
                      className={styles.downloadBtn}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Скачать
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
          <aside className={styles.note}>
            <FeatureIcon name="info" size={22} />
            <div>
              <h3 className={styles.noteTitle}>{docsNote.title}</h3>
              <p className={styles.noteText}>{docsNote.text}</p>
            </div>
          </aside>
        </div>
      </section>
      <FinalCtaSection />
      <ContactsSection />
    </>
  );
}
