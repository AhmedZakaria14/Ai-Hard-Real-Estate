import { SectorQuickActions } from '../../components/layout/SectorQuickActions';
import { useHVAC } from '../context/HVACContext';

export function HVACFloatingWidgets() {
  const { isAr } = useHVAC();
  const message = isAr
    ? 'السلام عليكم، أرغب بحجز موعد صيانة أو الاستفسار عن خدمات هارد للتكييف والتبريد.'
    : 'Hello HARD HVAC Maintenance, I would like to book a service or inquire about maintenance plans.';
  return <SectorQuickActions language={isAr ? 'ar' : 'en'} whatsappHref={`https://wa.me/966550641000?text=${encodeURIComponent(message)}`} />;
}
