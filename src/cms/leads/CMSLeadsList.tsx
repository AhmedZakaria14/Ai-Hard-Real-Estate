import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
} from 'lucide-react';
import { Language } from '../../types';
import { LeadRecord } from '../../lib/integrations/crmSync';

interface CMSLeadsListProps {
  leads: LeadRecord[];
  language: Language;
}

export const CMSLeadsList: React.FC<CMSLeadsListProps> = ({ leads, language }) => {
  const isAr = language === 'ar';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = leads.filter((l) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = l.name.toLowerCase().includes(q);
      const matchEmail = l.email.toLowerCase().includes(q);
      const matchPhone = l.phone.includes(q);
      const matchProp = l.property_title?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchProp) return false;
    }
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Name', 'Phone', 'Email', 'Type', 'Property', 'Message', 'Status'];
    const rows = filtered.map((l) => [
      l.created_at,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      l.inquiry_type,
      `"${(l.property_title || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HARD_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
          <input
            type="text"
            placeholder={isAr ? 'ابحث باسم العميل، الهاتف، أو العقار...' : 'Search by client name, phone, or property...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="new">{isAr ? 'جديد (New)' : 'New'}</option>
            <option value="contacted">{isAr ? 'تم التواصل' : 'Contacted'}</option>
            <option value="qualified">{isAr ? 'مؤهل للشراء' : 'Qualified'}</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير CSV' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p>{isAr ? 'لا توجد طلبات مطابقة حالياً' : 'No matching inquiries found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 text-start">{isAr ? 'العميل' : 'Client Name'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'معلومات التواصل' : 'Contact Info'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'نوع الطلب' : 'Inquiry Type'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'العقار المعني' : 'Target Property'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'الرسالة والملاحظات' : 'Message'}</th>
                  <th className="py-3.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px] dir-ltr text-start">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{item.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{item.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold uppercase">
                        {item.inquiry_type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-semibold line-clamp-1 max-w-[200px]">
                        {item.property_title || (isAr ? 'استفسار عام' : 'General Inquiry')}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-500 text-[11px]">
                      {item.message || '-'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'contacted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
