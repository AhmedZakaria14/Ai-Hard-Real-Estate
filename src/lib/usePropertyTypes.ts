import { useEffect, useState } from 'react';
import { subscribeSectorSection } from './db/hardSectorSections';
import { defaultPropertyTypes, propertyTypesSection, validPropertyTypes } from './propertyTaxonomy';

export function usePropertyTypes() {
  const [types, setTypes] = useState(defaultPropertyTypes);
  useEffect(() => subscribeSectorSection(propertyTypesSection, defaultPropertyTypes, (value) => {
    if (validPropertyTypes(value)) setTypes(value);
  }), []);
  return types;
}
