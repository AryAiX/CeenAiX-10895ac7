import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Info, Send } from 'lucide-react';
import { OpsShell } from '../../components/OpsShell';
import { usePharmacyPrescriptionQueue } from '../../hooks';
import { PHARMACY_NAV_ITEMS } from './navItems';

interface PharmacyMessage {
  id: string;
  contact: string;
  specialty: string;
  type: 'doctor' | 'patient' | 'system' | 'dha';
  status: 'awaiting' | 'sent' | 'resolved' | 'info';
  unread: number;
  lastMessage: string;
  thread: Array<{ sender: 'pharmacy' | 'contact'; kind: 'query' | 'approval' | 'info' | 'response'; content: string; time: string }>;
}

const typeStyles: Record<PharmacyMessage['type'], { border: string; bg: string; tag: string; avatar: string }> = {
  doctor: { border: 'border-l-amber-500', bg: 'bg-amber-50', tag: 'DOCTOR', avatar: 'bg-amber-500' },
  patient: { border: 'border-l-teal-500', bg: 'bg-teal-50', tag: 'PATIENT', avatar: 'bg-teal-500' },
  system: { border: 'border-l-slate-400', bg: 'bg-slate-50', tag: 'SYSTEM', avatar: 'bg-slate-500' },
  dha: { border: 'border-l-red-500', bg: 'bg-red-50', tag: 'DHA', avatar: 'bg-red-500' },
};

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .padEnd(2, 'X')
    .toUpperCase();

export const PharmacyMessages = () => {
  const { t } = useTranslation('common');
  const { data } = usePharmacyPrescriptionQueue();
  const [draft, setDraft] = useState('');
  const messages = useMemo<PharmacyMessage[]>(() => {
    const firstQueue = data?.queue[0];
    return [
      {
        id: 'msg-doctor',
        contact: firstQueue?.prescriber ?? 'Dr. Ahmed Al Mansoori',
        specialty: 'Cardiology · Prescription clarification',
        type: 'doctor',
        status: 'awaiting',
        unread: 1,
        lastMessage: `Please confirm substitution for ${firstQueue?.medication ?? 'Atorvastatin 20mg'}.`,
        thread: [
          {
            sender: 'contact',
            kind: 'query',
            content: `Please confirm substitution for ${firstQueue?.medication ?? 'Atorvastatin 20mg'} before dispensing.`,
            time: '2:04 PM',
          },
          {
            sender: 'pharmacy',
            kind: 'response',
            content: 'Acknowledged. We are checking stock and insurance coverage now.',
            time: '2:06 PM',
          },
        ],
      },
      {
        id: 'msg-patient',
        contact: firstQueue?.patientName ?? 'Aisha Mohammed',
        specialty: 'Patient pickup window',
        type: 'patient',
        status: 'sent',
        unread: 0,
        lastMessage: 'Prescription will be ready after insurance verification.',
        thread: [
          {
            sender: 'contact',
            kind: 'info',
            content: 'Can I pick up my medication after 5 PM today?',
            time: '1:40 PM',
          },
          {
            sender: 'pharmacy',
            kind: 'response',
            content: 'Yes. We will notify you once insurance verification is complete.',
            time: '1:48 PM',
          },
        ],
      },
      {
        id: 'msg-dha',
        contact: 'DHA ePrescription',
        specialty: 'Regulatory feed',
        type: 'dha',
        status: 'info',
        unread: 0,
        lastMessage: 'Daily dispensing ledger is ready for submission.',
        thread: [
          {
            sender: 'contact',
            kind: 'approval',
            content: 'Daily dispensing ledger is ready for DHA submission.',
            time: '12:00 PM',
          },
        ],
      },
    ];
  }, [data?.queue]);

  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? 'msg-doctor');
  const selected = messages.find((message) => message.id === selectedId) ?? messages[0];
  const style = typeStyles[selected.type];

  return (
    <OpsShell
      title="Messages"
      subtitle="Pharmacy communications"
      eyebrow={t('pharmacy.dashboard.eyebrow')}
      navItems={PHARMACY_NAV_ITEMS(t, {
        prescriptions: data?.pendingPrescriptions || undefined,
        inventory: data?.lowStockAlerts || undefined,
        messages: messages.reduce((sum, item) => sum + item.unread, 0) || undefined,
      })}
      accent="emerald"
      variant="pharmacy"
    >
      <div className="flex min-h-full bg-slate-50">
        <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-4">
            <h2 className="text-[16px] font-bold text-slate-900">Messages</h2>
            <div className="text-xs text-slate-400">Pharmacy communications</div>
          </div>
          {messages.map((message) => {
            const itemStyle = typeStyles[message.type];
            const active = message.id === selected.id;
            return (
              <button
                key={message.id}
                type="button"
                onClick={() => setSelectedId(message.id)}
                className={`border-l-4 border-b border-slate-50 px-4 py-3.5 text-left transition ${itemStyle.border} ${
                  active ? itemStyle.bg : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="mb-1 flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${itemStyle.avatar}`}>
                    {initialsFor(message.contact)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-slate-800">{message.contact}</div>
                    <div className="truncate text-[11px] text-slate-500">{message.lastMessage}</div>
                  </div>
                  {message.unread ? (
                    <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {message.unread}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                    {itemStyle.tag}
                  </span>
                  <span className="truncate text-[10px] text-slate-400">{message.specialty}</span>
                </div>
              </button>
            );
          })}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className={`shrink-0 border-b border-slate-200 px-6 py-4 ${style.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${style.avatar}`}>
                {initialsFor(selected.contact)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900">{selected.contact}</div>
                <div className="text-xs text-slate-500">{selected.specialty}</div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">
                {selected.status}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {selected.thread.map((entry, index) => {
              const fromPharmacy = entry.sender === 'pharmacy';
              const Icon = entry.kind === 'approval' ? CheckCircle2 : entry.kind === 'query' ? AlertCircle : Info;
              return (
                <div key={`${entry.time}-${index}`} className={`flex ${fromPharmacy ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[68%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      fromPharmacy
                        ? 'rounded-br bg-emerald-600 text-white'
                        : entry.kind === 'query'
                          ? 'rounded-bl border border-amber-200 bg-amber-50 text-slate-800'
                          : entry.kind === 'approval'
                            ? 'rounded-bl border border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'rounded-bl border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {!fromPharmacy ? (
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        <Icon className="h-3 w-3" />
                        {entry.kind}
                      </div>
                    ) : null}
                    <div className="leading-6">{entry.content}</div>
                    <div className={`mt-2 text-right font-mono text-[10px] ${fromPharmacy ? 'text-white/60' : 'text-slate-400'}`}>
                      {entry.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a secure pharmacy response..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setDraft('')}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </OpsShell>
  );
};
