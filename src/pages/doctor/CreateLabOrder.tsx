import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Plus, TestTube2, Trash2 } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { useDoctorPatients, useQuery } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';

interface DraftLabOrderItem {
  id: string;
  testName: string;
  testCode: string;
}

const createDraftLabOrderItem = (): DraftLabOrderItem => ({
  id: crypto.randomUUID(),
  testName: '',
  testCode: '',
});

export const CreateLabOrder: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: patientsData } = useDoctorPatients(user?.id);
  const patients = useMemo(() => patientsData ?? [], [patientsData]);
  const [patientId, setPatientId] = useState(searchParams.get('patient') ?? '');
  const [appointmentId, setAppointmentId] = useState(searchParams.get('appointment') ?? '');
  const [items, setItems] = useState<DraftLabOrderItem[]>([createDraftLabOrderItem()]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: appointmentsData } = useQuery<
    Array<{ id: string; scheduled_at: string; chief_complaint: string | null }>
  >(
    async () => {
      if (!user?.id || !patientId) {
        return [];
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('id, scheduled_at, chief_complaint')
        .eq('doctor_id', user.id)
        .eq('patient_id', patientId)
        .eq('is_deleted', false)
        .order('scheduled_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    [user?.id ?? '', patientId]
  );

  const appointments = useMemo(() => appointmentsData ?? [], [appointmentsData]);

  const updateItem = (id: string, nextState: Partial<DraftLabOrderItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...nextState } : item))
    );
  };

  const submit = async () => {
    if (!user?.id || !patientId) {
      setFeedback({ type: 'error', message: t('doctor.createLabOrder.patientRequired') });
      return;
    }

    const normalizedItems = items
      .map((item) => ({
        testName: item.testName.trim(),
        testCode: item.testCode.trim(),
      }))
      .filter((item) => item.testName.length > 0);

    if (normalizedItems.length === 0) {
      setFeedback({ type: 'error', message: t('doctor.createLabOrder.itemRequired') });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const { data: insertedLabOrder, error: labOrderError } = await supabase
      .from('lab_orders')
      .insert({
        patient_id: patientId,
        doctor_id: user.id,
        appointment_id: appointmentId || null,
        status: 'ordered',
      })
      .select('id')
      .maybeSingle();

    if (labOrderError || !insertedLabOrder) {
      setSaving(false);
      setFeedback({ type: 'error', message: labOrderError?.message ?? t('doctor.createLabOrder.saveError') });
      return;
    }

    const { error: itemsError } = await supabase.from('lab_order_items').insert(
      normalizedItems.map((item) => ({
        lab_order_id: insertedLabOrder.id,
        test_name: item.testName,
        test_code: item.testCode || null,
        status: 'ordered',
      }))
    );

    if (itemsError) {
      setSaving(false);
      setFeedback({ type: 'error', message: itemsError.message });
      return;
    }

    await supabase.from('notifications').insert({
      user_id: patientId,
      type: 'system',
      title: 'New lab order created',
      body: 'Your doctor added a new lab order to your care plan.',
      action_url: '/patient/appointments',
    });

    setSaving(false);
    setFeedback({ type: 'success', message: t('doctor.createLabOrder.saveSuccess') });
    navigate('/doctor/lab-orders');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90">
      <Navigation role="doctor" />
      <PageHeader
        title={t('doctor.createLabOrder.title')}
        subtitle={t('doctor.createLabOrder.subtitle')}
        icon={<TestTube2 className="w-6 h-6 text-white" />}
        backTo="/doctor/lab-orders"
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {feedback ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                {t('doctor.createLabOrder.patient')}
              </span>
              <select
                value={patientId}
                onChange={(event) => {
                  setPatientId(event.target.value);
                  setAppointmentId('');
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">{t('doctor.createLabOrder.selectPatient')}</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                {t('doctor.createLabOrder.appointment')}
              </span>
              <select
                value={appointmentId}
                onChange={(event) => setAppointmentId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">{t('doctor.createLabOrder.selectAppointment')}</option>
                {appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {new Date(appointment.scheduled_at).toLocaleString(
                      i18n.language.startsWith('ar') ? 'ar-AE' : 'en-US'
                    )}
                    {appointment.chief_complaint ? ` • ${appointment.chief_complaint}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {t('doctor.createLabOrder.itemHeading', { count: index + 1 })}
                </h3>
                {items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('doctor.createLabOrder.remove')}</span>
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">
                    {t('doctor.createLabOrder.testName')}
                  </span>
                  <input
                    type="text"
                    value={item.testName}
                    onChange={(event) => updateItem(item.id, { testName: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-900">
                    {t('doctor.createLabOrder.testCode')}
                  </span>
                  <input
                    type="text"
                    value={item.testCode}
                    onChange={(event) => updateItem(item.id, { testCode: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setItems((current) => [...current, createDraftLabOrderItem()])}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"
          >
            <Plus className="h-4 w-4" />
            <span>{t('doctor.createLabOrder.addItem')}</span>
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
            <span>{saving ? t('doctor.createLabOrder.saving') : t('doctor.createLabOrder.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
