import { PageHero } from '../components/ui/PageHero';
import { MedflexWidget } from '../components/prices/MedflexWidget';
import { ConditionsSection } from '../components/prices/ConditionsSection';
import { PromotionsSection } from '../components/prices/PromotionsSection';
import { TaxInfoSection } from '../components/prices/TaxInfoSection';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import { ContactsSection } from '../components/home/ContactsSection';
import { pricesHero } from '../content/prices';

export function PricesPage() {
  return (
    <>
      <PageHero title={pricesHero.title} subtitle={pricesHero.subtitle} />
      <MedflexWidget />
      <ConditionsSection />
      <PromotionsSection />
      <TaxInfoSection />
      <FinalCtaSection />
      <ContactsSection />
    </>
  );
}
