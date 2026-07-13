import { PageHero } from '../components/ui/PageHero';
import { PhilosophySection } from '../components/about/PhilosophySection';
import { FounderSection } from '../components/about/FounderSection';
import { GallerySection } from '../components/about/GallerySection';
import { ProDoctorovReviews } from '../components/about/ProDoctorovReviews';
import { TeamCtaSection } from '../components/about/TeamCtaSection';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import { ContactsSection } from '../components/home/ContactsSection';
import { aboutHero } from '../content/about';

export function AboutPage() {
  return (
    <>
      <PageHero title={aboutHero.title} subtitle={aboutHero.subtitle} />
      <PhilosophySection />
      <FounderSection />
      <GallerySection />
      <ProDoctorovReviews />
      <TeamCtaSection />
      <FinalCtaSection />
      <ContactsSection />
    </>
  );
}
