import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FamilyTree } from '../../components/FamilyTree';
import { AccountSecurityPanel } from '../../components/AccountSecurityPanel';
import { Upload, Camera, User, Shield, Users, Plus, Trash2, CreditCard as Edit2, Save } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  emiratesId: string;
  profileImage?: string;
}

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const [profileImage, setProfileImage] = useState<string>('');
  const [emiratesIdFront, setEmiratesIdFront] = useState<string>('');
  const [emiratesIdBack, setEmiratesIdBack] = useState<string>('');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingInsurance, setIsEditingInsurance] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    emiratesId: '',
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [insuranceInfo, setInsuranceInfo] = useState({
    provider: '',
    policyNumber: '',
    memberId: '',
    groupNumber: '',
    coverageType: '',
    validFrom: '',
    validUntil: '',
    cardImage: '',
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState<Partial<FamilyMember>>({});

  const handleImageUpload = (type: 'profile' | 'emiratesFront' | 'emiratesBack' | 'insurance') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (type === 'profile') setProfileImage(result);
          else if (type === 'emiratesFront') setEmiratesIdFront(result);
          else if (type === 'emiratesBack') setEmiratesIdBack(result);
          else if (type === 'insurance') setInsuranceInfo({ ...insuranceInfo, cardImage: result });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleScanEmiratesId = () => {
    alert(t('patient.profile.scanAlert'));
  };

  const addFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.relationship) {
      setFamilyMembers([
        ...familyMembers,
        {
          id: Date.now().toString(),
          name: newFamilyMember.name,
          relationship: newFamilyMember.relationship,
          dateOfBirth: newFamilyMember.dateOfBirth || '',
          emiratesId: newFamilyMember.emiratesId || '',
          profileImage: newFamilyMember.profileImage,
        },
      ]);
      setNewFamilyMember({});
      setShowAddFamily(false);
    }
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));
  };

  return (
    <>
      <div className="animate-fadeIn">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          {t('patient.profile.title')}
        </h1>
        <p className="mt-2 text-[15px] text-slate-400">{t('patient.profile.subtitle')}</p>
      </div>

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 rounded-3xl border border-slate-100/80 bg-white p-8 shadow-xl backdrop-blur-sm">
              <div className="text-center">
                <div className="relative inline-block group">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-ceenai-blue via-ceenai-cyan to-sky-400 shadow-2xl ring-4 ring-cyan-100">
                    {profileImage ? (
                      <img src={profileImage} alt={t('patient.profile.altProfile')} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-20 h-20 text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => handleImageUpload('profile')}
                    className="absolute bottom-0 right-0 rounded-full bg-gradient-to-br from-ceenai-blue to-ceenai-cyan p-3 text-white shadow-xl ring-4 ring-white transition-all duration-200 hover:scale-110 hover:shadow-2xl"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                  {personalInfo.fullName || t('patient.profile.addYourName')}
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {t('patient.profile.idLine', {
                    id: personalInfo.emiratesId?.trim() ? personalInfo.emiratesId : t('patient.profile.notSet'),
                  })}
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div
                  className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border border-red-100/50 hover:border-red-200"
                  onClick={() => setIsEditingPersonal(true)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
                        {t('patient.profile.cardBloodType')}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {personalInfo.bloodType || t('patient.profile.notSet')}
                      </p>
                    </div>
                    {!isEditingPersonal && (
                      <div className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border border-blue-100/50 hover:border-blue-200"
                  onClick={() => setIsEditingPersonal(true)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                        {t('patient.profile.cardDob')}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {personalInfo.dateOfBirth || t('patient.profile.notSet')}
                      </p>
                    </div>
                    {!isEditingPersonal && (
                      <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border border-orange-100/50 hover:border-orange-200"
                  onClick={() => setIsEditingPersonal(true)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">
                        {t('patient.profile.cardEmergency')}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {personalInfo.emergencyContactName || t('patient.profile.notSet')}
                      </p>
                      {personalInfo.emergencyContactPhone && (
                        <p className="mt-1 text-sm text-slate-600">{personalInfo.emergencyContactPhone}</p>
                      )}
                    </div>
                    {!isEditingPersonal && (
                      <div className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="overflow-hidden rounded-3xl border border-slate-100/80 bg-white shadow-xl">
              <div className="flex items-center justify-between bg-gradient-to-r from-ceenai-blue to-ceenai-cyan p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{t('patient.profile.personalTitle')}</h3>
                    <p className="mt-1 text-sm text-cyan-100">{t('patient.profile.personalSub')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {isEditingPersonal ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  <span>{isEditingPersonal ? t('patient.profile.saveChanges') : t('patient.profile.editProfile')}</span>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.fullName')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={!isEditingPersonal}
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-ceenai-cyan focus:ring-4 focus:ring-cyan-500/20 disabled:bg-slate-50"
                        placeholder={t('patient.profile.phFullName')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.emiratesId')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={!isEditingPersonal}
                        value={personalInfo.emiratesId}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, emiratesId: e.target.value })}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-ceenai-cyan focus:ring-4 focus:ring-cyan-500/20 disabled:bg-slate-50"
                        placeholder={t('patient.profile.phEmiratesId')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.dob')}</label>
                    <div className="relative group">
                      <input
                        type="date"
                        disabled={!isEditingPersonal}
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-ceenai-cyan focus:ring-4 focus:ring-cyan-500/20 disabled:bg-slate-50"
                      />
                      {!isEditingPersonal && (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 opacity-0 transition-all duration-200 hover:bg-cyan-50 group-hover:opacity-100"
                        >
                          <Edit2 className="h-4 w-4 text-ceenai-blue" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.bloodType')}</label>
                    <div className="relative group">
                      <select
                        disabled={!isEditingPersonal}
                        value={personalInfo.bloodType}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, bloodType: e.target.value })}
                        className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-medium transition-all duration-200 focus:border-ceenai-cyan focus:ring-4 focus:ring-cyan-500/20 disabled:bg-slate-50"
                      >
                        <option value="">{t('patient.profile.selectBloodType')}</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                      {!isEditingPersonal && (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 opacity-0 transition-all duration-200 hover:bg-cyan-50 group-hover:opacity-100"
                        >
                          <Edit2 className="h-4 w-4 text-ceenai-blue" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.allergies')}</label>
                    <textarea
                      disabled={!isEditingPersonal}
                      value={personalInfo.allergies}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, allergies: e.target.value })}
                      rows={3}
                      className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-ceenai-cyan focus:ring-4 focus:ring-cyan-500/20 disabled:bg-slate-50"
                      placeholder={t('patient.profile.phAllergies')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.chronicConditions')}</label>
                    <textarea
                      disabled={!isEditingPersonal}
                      value={personalInfo.chronicConditions}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, chronicConditions: e.target.value })}
                      rows={3}
                      className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-ceenai-cyan focus:ring-4 focus:ring-cyan-500/20 disabled:bg-slate-50"
                      placeholder={t('patient.profile.phChronic')}
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.emergencyName')}</label>
                    <div className="relative group">
                      <input
                        type="text"
                        disabled={!isEditingPersonal}
                        value={personalInfo.emergencyContactName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactName: e.target.value })}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-ceenai-cyan focus:ring-4 focus:ring-cyan-500/20 disabled:bg-slate-50"
                        placeholder={t('patient.profile.phEmergencyName')}
                      />
                      {!isEditingPersonal && (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 opacity-0 transition-all duration-200 hover:bg-cyan-50 group-hover:opacity-100"
                        >
                          <Edit2 className="h-4 w-4 text-ceenai-blue" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.emergencyPhone')}</label>
                    <div className="relative group">
                      <input
                        type="tel"
                        disabled={!isEditingPersonal}
                        value={personalInfo.emergencyContactPhone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactPhone: e.target.value })}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-ceenai-cyan focus:ring-4 focus:ring-cyan-500/20 disabled:bg-slate-50"
                        placeholder={t('patient.profile.phEmergencyPhone')}
                      />
                      {!isEditingPersonal && (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 opacity-0 transition-all duration-200 hover:bg-cyan-50 group-hover:opacity-100"
                        >
                          <Edit2 className="h-4 w-4 text-ceenai-blue" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100/80 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{t('patient.profile.emiratesTitle')}</h3>
                    <p className="text-emerald-100 text-sm mt-1">{t('patient.profile.emiratesSub')}</p>
                  </div>
                </div>
                <button
                  onClick={handleScanEmiratesId}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t('patient.profile.scanId')}</span>
                </button>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-700">{t('patient.profile.frontSide')}</label>
                    <div
                      onClick={() => handleImageUpload('emiratesFront')}
                      className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50/50"
                    >
                      {emiratesIdFront ? (
                        <img src={emiratesIdFront} alt={t('patient.profile.altEmiratesFront')} className="max-h-48 mx-auto rounded-xl shadow-lg" />
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 transition-colors duration-300 group-hover:bg-emerald-100">
                            <Upload className="h-8 w-8 text-slate-400 transition-colors duration-300 group-hover:text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{t('patient.profile.clickUpload')}</p>
                            <p className="mt-1 text-xs text-slate-500">{t('patient.profile.emiratesFrontHint')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-700">{t('patient.profile.backSide')}</label>
                    <div
                      onClick={() => handleImageUpload('emiratesBack')}
                      className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50/50"
                    >
                      {emiratesIdBack ? (
                        <img src={emiratesIdBack} alt={t('patient.profile.altEmiratesBack')} className="max-h-48 mx-auto rounded-xl shadow-lg" />
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 transition-colors duration-300 group-hover:bg-emerald-100">
                            <Upload className="h-8 w-8 text-slate-400 transition-colors duration-300 group-hover:text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{t('patient.profile.clickUpload')}</p>
                            <p className="mt-1 text-xs text-slate-500">{t('patient.profile.emiratesBackHint')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100/80 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{t('patient.profile.insuranceTitle')}</h3>
                    <p className="text-violet-100 text-sm mt-1">{t('patient.profile.insuranceSub')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingInsurance(!isEditingInsurance)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {isEditingInsurance ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  <span>{isEditingInsurance ? t('patient.profile.saveChanges') : t('patient.profile.editInsurance')}</span>
                </button>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.insuranceProvider')}</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.provider}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, provider: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 disabled:bg-slate-50"
                      placeholder={t('patient.profile.phProvider')}
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.policyNumber')}</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.policyNumber}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, policyNumber: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 disabled:bg-slate-50"
                      placeholder={t('patient.profile.phPolicy')}
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.memberId')}</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.memberId}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, memberId: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 disabled:bg-slate-50"
                      placeholder={t('patient.profile.phMember')}
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.groupNumber')}</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.groupNumber}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, groupNumber: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 disabled:bg-slate-50"
                      placeholder={t('patient.profile.phGroup')}
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.coverageType')}</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.coverageType}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, coverageType: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 disabled:bg-slate-50"
                      placeholder={t('patient.profile.phCoverage')}
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">{t('patient.profile.validUntil')}</label>
                    <input
                      type="date"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.validUntil}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, validUntil: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-medium transition-all duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 disabled:bg-slate-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-slate-700">{t('patient.profile.insuranceCardLabel')}</label>
                    <div
                      onClick={() => isEditingInsurance && handleImageUpload('insurance')}
                      className={`group rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center transition-all duration-300 ${isEditingInsurance ? 'cursor-pointer hover:border-violet-500 hover:bg-violet-50/50' : 'cursor-not-allowed opacity-75'}`}
                    >
                      {insuranceInfo.cardImage ? (
                        <img src={insuranceInfo.cardImage} alt={t('patient.profile.altInsuranceCard')} className="max-h-48 mx-auto rounded-xl shadow-lg" />
                      ) : (
                        <div className="space-y-3">
                          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 transition-colors duration-300 ${isEditingInsurance ? 'group-hover:bg-violet-100' : ''}`}>
                            <Upload className={`h-8 w-8 text-slate-400 transition-colors duration-300 ${isEditingInsurance ? 'group-hover:text-violet-600' : ''}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{t('patient.profile.clickUpload')}</p>
                            <p className="mt-1 text-xs text-slate-500">{t('patient.profile.insuranceUploadHint')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100/80 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{t('patient.profile.familyTitle')}</h3>
                    <p className="text-orange-100 text-sm mt-1">{t('patient.profile.familySub')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddFamily(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t('patient.profile.addMember')}</span>
                </button>
              </div>
              <div className="p-8">
                <FamilyTree
                  members={familyMembers}
                  primaryUser={{
                    name: personalInfo.fullName || t('patient.profile.you'),
                    profileImage: profileImage,
                  }}
                />

                {familyMembers.length > 0 && (
                  <div className="mt-12 border-t-2 border-slate-100 pt-8">
                    <h4 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                      <Users className="w-5 h-5 text-orange-600" />
                      {t('patient.profile.familyListTitle')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {familyMembers.map((member) => (
                        <div key={member.id} className="group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-orange-50/30 p-5 transition-all duration-300 hover:border-orange-200 hover:shadow-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center ring-4 ring-orange-100 group-hover:ring-orange-200 transition-all duration-300">
                                {member.profileImage ? (
                                  <img src={member.profileImage} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <User className="w-7 h-7 text-white" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
                                <p className="text-sm text-orange-600 font-medium">{member.relationship}</p>
                                {member.dateOfBirth && (
                                  <p className="mt-1 text-xs text-slate-500">{member.dateOfBirth}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFamilyMember(member.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showAddFamily && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
                    <h4 className="mb-5 text-lg font-bold text-slate-900">{t('patient.profile.addFamilyTitle')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">{t('patient.profile.name')}</label>
                        <input
                          type="text"
                          value={newFamilyMember.name || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white font-medium"
                          placeholder={t('patient.profile.phMemberName')}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">{t('patient.profile.relationship')}</label>
                        <select
                          value={newFamilyMember.relationship || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white font-medium"
                        >
                          <option value="">{t('patient.profile.selectRelationship')}</option>
                          <option value="Spouse">{t('patient.profile.relSpouse')}</option>
                          <option value="Child">{t('patient.profile.relChild')}</option>
                          <option value="Parent">{t('patient.profile.relParent')}</option>
                          <option value="Sibling">{t('patient.profile.relSibling')}</option>
                          <option value="Other">{t('patient.profile.relOther')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">{t('patient.profile.dob')}</label>
                        <input
                          type="date"
                          value={newFamilyMember.dateOfBirth || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, dateOfBirth: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">{t('patient.profile.familyEmiratesId')}</label>
                        <input
                          type="text"
                          value={newFamilyMember.emiratesId || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, emiratesId: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white font-medium"
                          placeholder="784-XXXX-XXXXXXX-X"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={addFamilyMember}
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
                      >
                        {t('patient.profile.addMember')}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddFamily(false);
                          setNewFamilyMember({});
                        }}
                        className="rounded-xl border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50"
                      >
                        {t('patient.profile.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <AccountSecurityPanel tone="patient" />
          </div>
        </div>
      </div>
    </>
  );
};
