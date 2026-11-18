import { InterfaceText } from '../../components/ui/InterfaceText';
import { ManagedImg } from '../../components/ui/ManagedElements';
import { BrandLogo, usePublishedBrandEmblem } from '../../components/ui/BrandLogo';
import React from 'react';
import { useHVAC } from '../context/HVACContext';

interface HVACBrandLockupProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
}

export function HVACBrandLockup({
  className = '',
  size = 'md',
  showLogo = true,
}: HVACBrandLockupProps) {
  const { language } = useHVAC();
  return <BrandLogo sector="hvac" size={size} language={language} standardWordmark className={className} />;
}
