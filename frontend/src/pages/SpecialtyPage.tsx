import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDoctors } from '../api/cms';
import { getSpecialtyPage } from '../content/specialtyPages';
import type { Doctor } from '../types/cms';
import { SpecialtyHero } from '../components/specialty/SpecialtyHero';
import { SpecialtyApproach } from '../components/specialty/SpecialtyApproach';
import { SpecialtySteps } from '../components/specialty/SpecialtySteps';
import { SpecialtyWhen } from '../components/specialty/SpecialtyWhen';
import { SpecialtyFaq } from '../components/specialty/SpecialtyFaq';
import { SpecialtyPromotion } from '../components/specialty/SpecialtyPromotion';
import { SpecialtyDoctors } from '../components/specialty/SpecialtyDoctors';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import { ContactsSection } from '../components/home/ContactsSection';
import { PageStub } from '../components/layout/PageStub';

export function SpecialtyPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getSpecialtyPage(slug) : null;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !page) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDoctors(slug)
      .then(setDoctors)
      .finally(() => setLoading(false));
  }, [slug, page]);

  if (!page) {
    return <PageStub title="Страница не найдена" />;
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">Загрузка...</div>
      </section>
    );
  }

  const { pageContent } = page;
  const bookingUrl = page.bookingUrl ?? null;
  return (
    <>
      <SpecialtyHero page={page} />
      {page.template === 'standard' ? (
        <SpecialtyApproach data={pageContent.approach} />
      ) : (
        <SpecialtySteps steps={pageContent.steps} features={pageContent.features} />
      )}
      <SpecialtyWhen data={pageContent.when} bookingUrl={bookingUrl} />
      <SpecialtyFaq data={pageContent.faq} bookingUrl={bookingUrl} />
      <SpecialtyPromotion promotion={pageContent.promotion} bookingUrl={bookingUrl} />
      <SpecialtyDoctors title={pageContent.doctorsSectionTitle} doctors={doctors} />
      <FinalCtaSection subtitle={pageContent.finalCta?.subtitle} />
      <ContactsSection />
    </>
  );
}
