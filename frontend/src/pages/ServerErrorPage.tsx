import { ErrorStatusPage } from '../components/layout/ErrorStatusPage';

interface ServerErrorPageProps {
  onRetry?: () => void;
}

export function ServerErrorPage({ onRetry }: ServerErrorPageProps) {
  return (
    <ErrorStatusPage
      code={500}
      title="Что-то пошло не так"
      description="На сервере произошла ошибка. Мы уже работаем над этим. Попробуйте обновить страницу чуть позже или свяжитесь с клиникой по телефону."
      homeLabel={onRetry ? 'Обновить страницу' : 'На главную'}
      onHomeClick={onRetry}
      secondaryTo="/contacts"
      secondaryLabel="Контакты"
    />
  );
}
