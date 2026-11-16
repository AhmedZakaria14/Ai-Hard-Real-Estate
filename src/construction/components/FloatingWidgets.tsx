import { SectorQuickActions } from '../../components/layout/SectorQuickActions';
import { useConstruction } from '../context/ConstructionContext';
import { COMPANY_CREDENTIALS } from '../data/seedData';

export function FloatingWidgets() {
  const { language } = useConstruction();
  const whatsappHref = 'https://wa.me/' + COMPANY_CREDENTIALS.whatsapp.replace(/\D/g, '');
  return <SectorQuickActions language={language} whatsappHref={whatsappHref} />;
}
