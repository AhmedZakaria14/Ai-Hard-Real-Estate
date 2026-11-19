import { SectorQuickActions } from '../../components/layout/SectorQuickActions';
import { useConstruction } from '../context/ConstructionContext';
import { SECTOR_CONTACT_DETAILS } from '../../lib/sectors';

export function FloatingWidgets() {
  const { language } = useConstruction();
  const whatsappHref = 'https://wa.me/' + SECTOR_CONTACT_DETAILS.construction.whatsapp.replace(/\D/g, '');
  return <SectorQuickActions language={language} whatsappHref={whatsappHref} />;
}
