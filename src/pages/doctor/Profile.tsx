import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  CircleUser as UserCircle,
  MapPin,
  Save,
  CreditCard as Edit2,
  X,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { AccountSecurityPanel } from '../../components/AccountSecurityPanel';
import { PageHeader } from '../../components/PageHeader';
import { SpecializationMultiSelect } from '../../components/SpecializationMultiSelect';
import { useDoctorSpecializationIds, useSpecializations } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import {
  getPrimaryAndSecondarySpecializations,
  getSelectedSpecializations,
  syncDoctorSpecializations,
} from '../../lib/doctor-specializations';
import { supabase } from '../../lib/supabase';

interface DoctorProfileFormState {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  selectedSpecializationIds: string[];
  licenseNumber: string;
  bio: string;
}

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: null, lastName: null };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

export const DoctorProfile: React.FC = () => {
  const { doctorProfile, isLoading, profile, refreshProfile, user } = useAuth();
  const isPhoneManagedByOtp = Boolean(user?.phone && !user?.email);
  const {
    data: specializationOptions = [],
    loading: specializationsLoading,
    error: specializationsError,
  } = useSpecializations();
  const {
    data: doctorSpecializationIds = [],
    loading: doctorSpecializationIdsLoading,
    refetch: refetchDoctorSpecializationIds,
  } = useDoctorSpecializationIds(user?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<DoctorProfileFormState>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    selectedSpecializationIds: [],
    licenseNumber: '',
    bio: '',
  });
  const selectedSpecializations = useMemo(
    () => getSelectedSpecializations(formData.selectedSpecializationIds, specializationOptions),
    [formData.selectedSpecializationIds, specializationOptions]
  );
  const specializationSummary =
    selectedSpecializations.length > 0
      ? selectedSpecializations.map((specialization) => specialization.name).join(', ')
      : 'Add your specialization to complete your clinician profile';

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setFormData({
      fullName: profile?.full_name ?? '',
      email: user?.email ?? profile?.email ?? '',
      phone: profile?.phone ?? user?.phone ?? '',
      dateOfBirth: profile?.date_of_birth ?? '',
      gender: profile?.gender ?? '',
      address: profile?.address ?? '',
      selectedSpecializationIds: doctorSpecializationIds,
      licenseNumber: doctorProfile?.license_number ?? '',
      bio: doctorProfile?.bio ?? '',
    });
  }, [doctorProfile, doctorSpecializationIds, isEditing, profile, specializationOptions, user]);

  const handleSave = async () => {
    if (!user) {
      setErrorMessage('You must be signed in to update your doctor profile.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (formData.selectedSpecializationIds.length === 0) {
      setErrorMessage('Select at least one specialization before saving your doctor profile.');
      setSaving(false);
      return;
    }

    const parsedName = splitFullName(formData.fullName);
    const { primarySpecialization, secondarySpecialization } = getPrimaryAndSecondarySpecializations(
      formData.selectedSpecializationIds,
      specializationOptions
    );
    const persistedPhone = isPhoneManagedByOtp ? user?.phone ?? profile?.phone ?? null : formData.phone.trim() || null;

    const { error: userProfileError } = await supabase.from('user_profiles').upsert(
      {
        user_id: user.id,
        role: 'doctor',
        full_name: formData.fullName.trim() || 'Doctor',
        first_name: parsedName.firstName,
        last_name: parsedName.lastName,
        phone: persistedPhone,
        email: user.email ?? (formData.email.trim() || null),
        address: formData.address.trim() || null,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        profile_completed: profile?.profile_completed ?? false,
        terms_accepted: profile?.terms_accepted ?? true,
        notification_preferences: profile?.notification_preferences ?? {},
        city: profile?.city ?? null,
        avatar_url: profile?.avatar_url ?? null,
        emirates_id: profile?.emirates_id ?? null,
      },
      { onConflict: 'user_id' }
    );

    if (userProfileError) {
      setErrorMessage(userProfileError.message);
      setSaving(false);
      return;
    }

    const { error: doctorProfileError } = await supabase.from('doctor_profiles').upsert(
      {
        user_id: user.id,
        specialization: primarySpecialization,
        license_number: formData.licenseNumber.trim() || null,
        bio: formData.bio.trim() || null,
        sub_specialization: secondarySpecialization,
        years_of_experience: doctorProfile?.years_of_experience ?? null,
        consultation_fee: doctorProfile?.consultation_fee ?? null,
        languages_spoken: doctorProfile?.languages_spoken ?? ['English'],
        dha_license_verified: doctorProfile?.dha_license_verified ?? false,
        dha_verified_at: doctorProfile?.dha_verified_at ?? null,
      },
      { onConflict: 'user_id' }
    );

    if (doctorProfileError) {
      setErrorMessage(doctorProfileError.message);
      setSaving(false);
      return;
    }

    try {
      await syncDoctorSpecializations(user.id, formData.selectedSpecializationIds);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save doctor specializations.');
      setSaving(false);
      return;
    }

    await Promise.all([refreshProfile(), refetchDoctorSpecializationIds()]);
    setSaving(false);
    setIsEditing(false);
    setSuccessMessage('Doctor profile updated.');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation role="doctor" />
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="doctor" />
      <PageHeader
        title="Doctor Profile"
        subtitle="Review and update the profile information patients will rely on."
        icon={<User className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
        actions={
          !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              <Edit2 className="w-4 h-4" />
              Edit profile
            </button>
          ) : null
        }
      />

      <div className="py-8">
        <div className="mx-auto max-w-4xl space-y-8 px-4">
          <div className="overflow-hidden rounded-3xl bg-white shadow-md">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-12">
              <div className="flex items-center space-x-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
                  <User className="w-12 h-12 text-teal-600" />
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-bold">{formData.fullName || 'Doctor profile'}</h2>
                  <p className="mt-1 text-emerald-100">
                    {specializationSummary}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6">
              {errorMessage ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <h3 className="mb-4 text-lg font-semibold text-gray-900">Professional Information</h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500"
                    />
                  </div>

                  {!isPhoneManagedByOtp ? (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  ) : null}

                  <SpecializationMultiSelect
                    label="Specialization"
                    options={specializationOptions}
                    selectedIds={formData.selectedSpecializationIds}
                    onChange={(value) => setFormData({ ...formData, selectedSpecializationIds: value })}
                    loading={specializationsLoading || doctorSpecializationIdsLoading}
                    helperText={
                      specializationsError
                        ? 'Specializations could not be loaded yet.'
                        : 'Search and select one or more specialties. Selected items appear as chips.'
                    }
                  />

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">License Number</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(event) =>
                        setFormData({ ...formData, licenseNumber: event.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your medical license number"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(event) =>
                        setFormData({ ...formData, dateOfBirth: event.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(event) => setFormData({ ...formData, gender: event.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                      rows={3}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Professional Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                      rows={4}
                      placeholder="Summarize your expertise and care approach"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-base text-gray-900">{formData.email || 'Not provided'}</p>
                    </div>
                  </div>

                  {!isPhoneManagedByOtp ? (
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="mt-1 text-base text-gray-900">{formData.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <Stethoscope className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Specialization</p>
                      {selectedSpecializations.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedSpecializations.map((specialization) => (
                            <span
                              key={specialization.id}
                              className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700"
                            >
                              {specialization.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-base text-gray-900">
                          Not provided
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">License Number</p>
                      <p className="mt-1 text-base text-gray-900">
                        {formData.licenseNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="mt-1 text-base text-gray-900">
                        {formData.dateOfBirth
                          ? new Date(formData.dateOfBirth).toLocaleDateString()
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <UserCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gender</p>
                      <p className="mt-1 text-base capitalize text-gray-900">
                        {formData.gender || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 md:col-span-2">
                    <div className="mt-1">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="mt-1 text-base text-gray-900">{formData.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 md:col-span-2">
                    <div className="mt-1">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bio</p>
                      <p className="mt-1 text-base text-gray-900">{formData.bio || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AccountSecurityPanel tone="doctor" />
        </div>
      </div>
    </div>
  );
};
