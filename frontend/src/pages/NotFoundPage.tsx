import { ErrorStatusPage } from '../components/layout/ErrorStatusPage';

export function NotFoundPage() {
  return (
    <ErrorStatusPage
      code={404}
      title="Страница не найдена"
      description="Такой страницы нет или она была перемещена. Проверьте адрес или вернитесь на главную — там можно записаться к врачу и найти нужный раздел."
      secondaryTo="/doctors"
      secondaryLabel="Все врачи"
    />
  );
}
