import { useEffect, useState } from 'react';
import { fetchDoctors } from '../api/cms';
import type { Doctor } from '../types/cms';
import { SpecialtyDoctors } from '../components/specialty/SpecialtyDoctors';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import { ContactsSection } from '../components/home/ContactsSection';
import { PageHero } from '../components/ui/PageHero';

export function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors()
      .then(setDoctors)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero title="Врачи клиники" />
      {loading ? (
        <section className="section">
          <div className="container">Загрузка...</div>
        </section>
      ) : (
        <SpecialtyDoctors doctors={doctors} />
      )}
      <FinalCtaSection />
      <ContactsSection />
    </>
  );
}
