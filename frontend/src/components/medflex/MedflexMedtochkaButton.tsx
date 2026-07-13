import { MEDFLEX_MEDTOCHKA_WIDGET_SRC } from '../../content/medflex';
import { useMedflexMedtochkaScript } from '../../hooks/useMedflexMedtochkaScript';
import styles from './MedflexMedtochkaButton.module.css';

interface MedflexMedtochkaButtonProps {
  variant: 'desktop' | 'mobile';
  className?: string;
}

export function MedflexMedtochkaButton({ variant, className = '' }: MedflexMedtochkaButtonProps) {
  useMedflexMedtochkaScript();

  const id =
    variant === 'desktop' ? 'medflexMedtochkaWidgetButton' : 'medflexMedtochkaWidgetButtonMobile';
  const variantClass = variant === 'desktop' ? styles.desktop : styles.mobile;

  return (
    <div
      id={id}
      data-src={MEDFLEX_MEDTOCHKA_WIDGET_SRC}
      className={`${variantClass} ${className}`.trim()}
    />
  );
}
