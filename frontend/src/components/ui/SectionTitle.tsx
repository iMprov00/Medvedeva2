import type { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2';
}

export function SectionTitle({ children, className = '', as = 'h2' }: SectionTitleProps) {
  const Tag = as;
  return <Tag className={`sectionTitle ${className}`.trim()}>{children}</Tag>;
}
