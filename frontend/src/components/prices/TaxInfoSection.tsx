import { useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { taxInfo } from '../../content/prices';
import { Button } from '../ui/Button';
import { FeatureIcon } from '../ui/FeatureIcon';
import styles from './TaxInfoSection.module.css';

export function TaxInfoSection() {
  const { settings } = useSiteSettings();
  const [copied, setCopied] = useState(false);

  const mailSubject = encodeURIComponent('Запрос на справку для налогового вычета');
  const mailBody = encodeURIComponent(
    'Добрый день! Прошу подготовить справку для налогового вычета.\n\nМои данные:\n- ФИО налогоплательщика:\n- Дата рождения:\n- ИНН:\n\nПериод, за который необходима справка:\n\nДанные пациента:\n- ФИО:\n- Дата рождения:\n- ИНН (или данные паспорта):',
  );

  function copyEmail() {
    navigator.clipboard.writeText(settings.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="section sectionToneMuted" id="useful">
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Полезная информация</h2>
          <p className={styles.subtitle}>Важные документы и справки</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeading}>
            <div className={styles.headingIcon}>
              <FeatureIcon name="percent" size={18} />
            </div>
            <h3 className={styles.cardTitle}>{taxInfo.title}</h3>
          </div>
          <p className={styles.intro}>{taxInfo.intro}</p>
          <div className={styles.methods}>
            {taxInfo.methods.map((method) => (
              <article key={method.title} className={styles.method}>
                <div className={styles.methodIcon}>
                  <FeatureIcon name={method.icon} size={16} />
                </div>
                <div>
                  <h4 className={styles.methodTitle}>{method.title}</h4>
                  <p className={styles.methodText}>{method.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.emailBlock}>
            <h4 className={styles.blockTitle}>
              <FeatureIcon name="list" size={16} className={styles.blockTitleIcon} />
              Что указать в письме:
            </h4>
            <ul className={styles.emailList}>
              {taxInfo.emailItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={styles.notes}>
            <h4 className={styles.blockTitle}>
              <FeatureIcon name="info" size={16} className={styles.blockTitleIcon} />
              Важная информация:
            </h4>
            <ul>
              {taxInfo.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div className={styles.actions}>
            <Button href={`mailto:${settings.email}?subject=${mailSubject}&body=${mailBody}`}>
              Написать письмо
            </Button>
            <Button variant="outline" onClick={copyEmail}>
              {copied ? 'Скопировано!' : 'Скопировать email'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
