import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserCheck } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { SpecializationMultiSelect } from '../../components/SpecializationMultiSelect';
import { useDoctorSpecializationIds, useSpecializations } from '../../hooks';
import {
  deriveLegacySpecializationIds,
  getPrimaryAndSecondarySpecializations,
  syncDoctorSpecializations,
} from '../../lib/doctor-specializations';
import { getDefaultRouteForRole, useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import type { UserRole } from '../../types';

interface OnboardingFormState {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  selectedSpecializationIds: string[];
  licenseNumber: string;
  bio: string;
  termsAccepted: boolean;
}

const safeString = (value: unknown) => (typeof value === 'string' ? value : '');

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: null,
      lastName: null,
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: null,
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const getOnboardingRole = (role: UserRole | null, metadataRole: unknown): UserRole => {
  if (role) {
    return role;
  }

  return metadataRole === 'doctor' ? 'doctor' : 'patient';
};

export const Onboarding = () => {
  const navigate = useNavigate();
  const { doctorProfile, patientProfile, profile, refreshProfile, role, user } = useAuth();

  const [hasInitialized, setHasInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<OnboardingFormState>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    selectedSpecializationIds: [],
    licenseNumber: '',
    bio: '',
    termsAccepted: false,
  });
  const [hasInitializedDoctorSpecializations, setHasInitializedDoctorSpecializations] = useState(false);

  const activeRole = useMemo(
    () => getOnboardingRole(role, user?.user_metadata?.role),
    [role, user?.user_metadata?.role]
  );
  const isPhoneManagedByOtp = Boolean(user?.phone && !user?.email);
  const {
    data: specializationOptions = [],
    loading: specializationsLoading,
    error: specializationsError,
  } = useSpecializations();
  const {
    data: doctorSpecializationIds = [],
    loading: doctorSpecializationIdsLoading,
  } = useDoctorSpecializationIds(user?.id);

  useEffect(() => {
    if (hasInitialized || !user) {
      return;
    }

    setForm({
      fullName:
        profile?.full_name ??
        safeString(user.user_metadata?.full_name) ??
        safeString(user.email) ??
        '',
      email: profile?.email ?? user.email ?? '',
      phone: profile?.phone ?? user.phone ?? '',
      city: profile?.city ?? '',
      address: profile?.address ?? '',
      emergencyContactName: patientProfile?.emergency_contact_name ?? '',
      emergencyContactPhone: patientProfile?.emergency_contact_phone ?? '',
      selectedSpecializationIds: [],
      licenseNumber: doctorProfile?.license_number ?? '',
      bio: doctorProfile?.bio ?? '',
      termsAccepted: profile?.terms_accepted ?? Boolean(user.user_metadata?.terms_accepted),
    });
    setHasInitialized(true);
  }, [doctorProfile, hasInitialized, patientProfile, profile, user]);

  useEffect(() => {
    if (
      activeRole !== 'doctor' ||
      hasInitializedDoctorSpecializations ||
      !user ||
      specializationsLoading ||
      doctorSpecializationIdsLoading
    ) {
      return;
    }

    const initialSpecializationIds =
      doctorSpecializationIds.length > 0
        ? doctorSpecializationIds
        : deriveLegacySpecializationIds(doctorProfile, specializationOptions);

    setForm((current) => ({
      ...current,
      selectedSpecializationIds: initialSpecializationIds,
    }));
    setHasInitializedDoctorSpecializations(true);
  }, [
    activeRole,
    doctorProfile,
    doctorSpecializationIds,
    doctorSpecializationIdsLoading,
    hasInitializedDoctorSpecializations,
    specializationsLoading,
    specializationOptions,
    user,
  ]);

  const updateField = <Key extends keyof OnboardingFormState>(
    field: Key,
    value: OnboardingFormState[Key]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user) {
      setErrorMessage('You must be signed in to complete onboarding.');
      return;
    }

    if (!form.fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!user.email && !form.email.trim()) {
      setErrorMessage('Email is required when signing up with phone OTP.');
      return;
    }

    if (!form.termsAccepted) {
      setErrorMessage('Please accept the terms to complete onboarding.');
      return;
    }

    setIsSubmitting(true);

    const parsedName = splitFullName(form.fullName);
    const persistedPhone = isPhoneManagedByOtp ? user?.phone ?? profile?.phone ?? null : form.phone.trim() || null;

    const { error: profileError } = await supabase.from('user_profiles').upsert(
      {
        user_id: user.id,
        role: activeRole,
        full_name: form.fullName.trim(),
        first_name: parsedName.firstName,
        last_name: parsedName.lastName,
        phone: persistedPhone,
        email: user.email ?? (form.email.trim() || null),
        city: form.city.trim() || null,
        address: form.address.trim() || null,
        avatar_url: profile?.avatar_url ?? null,
        date_of_birth: profile?.date_of_birth ?? null,
        gender: profile?.gender ?? null,
        emirates_id: profile?.emirates_id ?? null,
        notification_preferences: profile?.notification_preferences ?? {},
        profile_completed: true,
        terms_accepted: form.termsAccepted,
      },
      { onConflict: 'user_id' }
    );

    if (profileError) {
      setErrorMessage(profileError.message);
      setIsSubmitting(false);
      return;
    }

    if (activeRole === 'patient') {
      const { error } = await supabase.from('patient_profiles').upsert(
        {
          user_id: user.id,
          emergency_contact_name: form.emergencyContactName.trim() || null,
          emergency_contact_phone: form.emergencyContactPhone.trim() || null,
          blood_type: patientProfile?.blood_type ?? null,
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }
    }

    if (activeRole === 'doctor') {
      const { primarySpecialization, secondarySpecialization } = getPrimaryAndSecondarySpecializations(
        form.selectedSpecializationIds,
        specializationOptions
      );

      const { error } = await supabase.from('doctor_profiles').upsert(
        {
          user_id: user.id,
          specialization: primarySpecialization,
          license_number: form.licenseNumber.trim() || null,
          bio: form.bio.trim() || null,
          sub_specialization: secondarySpecialization,
          years_of_experience: doctorProfile?.years_of_experience ?? null,
          consultation_fee: doctorProfile?.consultation_fee ?? null,
          languages_spoken: doctorProfile?.languages_spoken ?? [],
          dha_license_verified: doctorProfile?.dha_license_verified ?? false,
          dha_verified_at: doctorProfile?.dha_verified_at ?? null,
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      try {
        await syncDoctorSpecializations(user.id, form.selectedSpecializationIds);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save doctor specializations.');
        setIsSubmitting(false);
        return;
      }
    }

    await refreshProfile();
    setSuccessMessage('Onboarding saved. Redirecting to your dashboard...');
    setIsSubmitting(false);
    navigate(getDefaultRouteForRole(activeRole), { replace: true });
  };

  return (
    <AuthShell
      badge="Profile Setup"
      title="Complete your profile"
      description="Finish the first authenticated setup so CeenAiX can route you to the correct experience and prepare your profile data for future workflows."
    >
      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-gray-700">Full name</span>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-gray-700">
              Email address
              {!user?.email ? ' *' : ''}
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
              placeholder="you@example.com"
              autoComplete="email"
              required={!user?.email}
              disabled={Boolean(user?.email)}
            />
          </label>

          {!isPhoneManagedByOtp ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">Phone number</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                placeholder="+971 50 123 4567"
                autoComplete="tel"
              />
            </label>
          ) : null}
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-gray-700">City</span>
          <input
            type="text"
            value={form.city}
            onChange={(event) => updateField('city', event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
            placeholder="Dubai, Abu Dhabi, Sharjah..."
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-gray-700">Address</span>
          <textarea
            value={form.address}
            onChange={(event) => updateField('address', event.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
            placeholder="Add your preferred address for care coordination"
          />
        </label>

        {activeRole === 'patient' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">Emergency contact name</span>
              <input
                type="text"
                value={form.emergencyContactName}
                onChange={(event) => updateField('emergencyContactName', event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                placeholder="Who should we contact?"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">Emergency contact phone</span>
              <input
                type="tel"
                value={form.emergencyContactPhone}
                onChange={(event) => updateField('emergencyContactPhone', event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                placeholder="+971 50 000 0000"
              />
            </label>
          </div>
        ) : null}

        {activeRole === 'doctor' ? (
          <>
            <SpecializationMultiSelect
              label="Specialization"
              options={specializationOptions}
              selectedIds={form.selectedSpecializationIds}
              onChange={(value) => updateField('selectedSpecializationIds', value)}
              loading={specializationsLoading || doctorSpecializationIdsLoading}
              helperText={
                specializationsError
                  ? 'Specializations could not be loaded yet.'
                  : 'Search and choose one or more specialties. Selected items appear as chips.'
              }
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">License number</span>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(event) => updateField('licenseNumber', event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                  placeholder="Professional license"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">Professional bio</span>
              <textarea
                value={form.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                placeholder="Summarize your expertise and patient care focus"
              />
            </label>
          </>
        ) : null}

        <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
          <input
            type="checkbox"
            checked={form.termsAccepted}
            onChange={(event) => updateField('termsAccepted', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-ceenai-blue focus:ring-ceenai-cyan"
          />
          <span className="text-sm leading-relaxed text-gray-600">
            I confirm the profile information is accurate and consent to use CeenAiX according to the platform terms.
          </span>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(getDefaultRouteForRole(activeRole), { replace: true })}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:border-ceenai-cyan hover:text-ceenai-blue"
          >
            Skip for now
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserCheck className="h-4 w-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save and continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </AuthShell>
  );
};
