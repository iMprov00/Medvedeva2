import { HeroSection } from '../components/home/HeroSection';
import { CertificatesSection } from '../components/home/CertificatesSection';
import { DirectionsSection } from '../components/home/DirectionsSection';
import { PrinciplesSection } from '../components/home/PrinciplesSection';
import { EvidenceSection } from '../components/home/EvidenceSection';
import { FirstClinicSection } from '../components/home/FirstClinicSection';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import { ContactsSection } from '../components/home/ContactsSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CertificatesSection />
      <DirectionsSection />
      <PrinciplesSection />
      <EvidenceSection />
      <FirstClinicSection />
      <FinalCtaSection />
      <ContactsSection />
    </>
  );
}
