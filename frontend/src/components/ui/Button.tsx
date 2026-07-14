import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'outline' | 'pill';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  to?: string;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  target?: string;
  rel?: string;
}

export function Button({
  children,
  variant = 'primary',
  href,
  to,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  target,
  rel,
}: ButtonProps) {
  const classes = `${styles.button} ${styles[variant]} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
