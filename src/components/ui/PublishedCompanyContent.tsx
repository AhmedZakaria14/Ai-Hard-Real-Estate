import { LocalizedValue } from './LocalizedValue';
import { ManagedImg } from './ManagedElements';
import { useEffect, useState } from 'react';
import { readCompanyContent } from '../../lib/db/companyContent';
import { getLocalizedText } from '../../lib/utils';
import type { Language, Testimonial } from '../../types';
import type { TeamMember, OfficeLocation, PartnerBrand, BusinessStatistic } from '../../types/businessEntities';

type PublicCompanyContent = {
  team: TeamMember[];
  offices: OfficeLocation[];
  statistics: BusinessStatistic[];
  partners: PartnerBrand[];
  stories: Testimonial[];
};

export function usePublishedCompanyContent() {
  const [content, setContent] = useState<PublicCompanyContent>({
    team: [], offices: [], statistics: [], partners: [], stories: [],
  });
  useEffect(() => {
    const controller = new AbortController();
    let generation = 0;
    const refresh = () => {
    const version = ++generation;
    void readCompanyContent(controller.signal).then((rows) => {
      if (controller.signal.aborted) return;
      if (version !== generation) return;
      const byKind = <T,>(kind: keyof PublicCompanyContent) =>
        rows.filter((row: { kind: string }) => row.kind === kind)
          .map((row) => row.body as T);
      const ordered = <T extends { order?: number }>(items: T[]) => items.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
      setContent({
        team: ordered(byKind<TeamMember>('team')),
        offices: ordered(byKind<OfficeLocation>('offices')),
        statistics: ordered(byKind<BusinessStatistic>('statistics')),
        partners: ordered(byKind<PartnerBrand>('partners')),
        stories: byKind<Testimonial>('stories'),
      });
    }).catch((error) => { if (!controller.signal.aborted) console.error('Company directory unavailable', error); });
    };
    const stored = (event: StorageEvent) => { if (event.key === 'hard-company-saved') refresh(); };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('hard-company-saved', refresh);
    window.addEventListener('storage', stored);
    return () => { controller.abort(); window.removeEventListener('focus', refresh); window.removeEventListener('hard-company-saved', refresh); window.removeEventListener('storage', stored); };
  }, []);
  return content;
}

export function PublishedCompanyContent({ language }: { language: Language }) {
  const { team, offices, statistics, partners } = usePublishedCompanyContent();
  const ar = language === 'ar';
  const localized = (value: Parameters<typeof getLocalizedText>[0]) => getLocalizedText(value, language);
  const sections = [
    { id: 'team', title: ar ? 'فريق العمل والقيادات' : 'Team and leadership', cards: team.map((x) => ({ id: x.id, name: localized(x.name), detail: localized(x.role), image: x.avatar })) },
    { id: 'offices', title: ar ? 'الفروع والمقرات' : 'Offices', cards: offices.map((x) => ({ id: x.id, name: localized(x.name), detail: [localized(x.city), localized(x.address)].filter(Boolean).join(' · '), image: x.image })) },
    { id: 'statistics', title: ar ? 'المؤشرات والأرقام' : 'Key figures', cards: statistics.map((x) => ({ id: x.id, name: localized(x.label), detail: localized(x.description), value: x.value, image: undefined })) },
    { id: 'partners', title: ar ? 'الشركاء والعلامات التجارية' : 'Partners and brands', cards: partners.map((x) => ({ id: x.id, name: localized(x.name), detail: localized(x.category), image: x.logoUrl })) },
  ];

  return <div className="mx-auto max-w-7xl space-y-12 px-4 pb-12">
    {sections.filter((section) => section.cards.length).map((section) => <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-bold"><LocalizedValue value={section.title} /></h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {section.cards.map((card) => <article key={card.id} className="space-y-2 rounded-2xl border border-slate-200 p-4">
          {card.image && <ManagedImg copyScope="realestate.PublishedCompanyContent" src={card.image} alt={card.name} loading="lazy" className="h-32 w-full object-contain" />}
          {'value' in card && <p className="text-2xl font-bold"><LocalizedValue value={card.value} /></p>}
          <h3 className="font-semibold"><LocalizedValue value={card.name} /></h3>
          {card.detail && <p className="text-sm text-slate-600"><LocalizedValue value={card.detail} /></p>}
        </article>)}
      </div>
    </section>)}
  </div>;
}
