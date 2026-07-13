import { PageHero } from '../components/ui/PageHero';
import { FeatureIcon } from '../components/ui/FeatureIcon';
import { docsHero, documents, docsNote } from '../content/docs';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import { ContactsSection } from '../components/home/ContactsSection';
import styles from './DocsPage.module.css';

export function DocsPage() {
  return (
    <>
      <PageHero title={docsHero.title} subtitle={docsHero.subtitle} />
      <section className="section sectionToneWhite">
        <div className="container">
          <div className={styles.grid}>
            {documents.map((doc) => (
              <article key={doc.title} className={styles.card}>
                <FeatureIcon name="list" size={22} />
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{doc.title}</h2>
                  {doc.description && <p className={styles.cardText}>{doc.description}</p>}
                  <a
                    href={doc.fileUrl}
                    download={doc.downloadName}
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
