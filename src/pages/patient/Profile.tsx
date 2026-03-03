import React, { useState } from 'react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { FamilyTree } from '../../components/FamilyTree';
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
    alert('Emirates ID scanning will be integrated with the device camera. This feature extracts information automatically from the ID card.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navigation role="patient" />
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and health records"
        icon={<User className="w-6 h-6 text-white" />}
        backTo="/patient/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100/50 backdrop-blur-sm sticky top-8">
              <div className="text-center">
                <div className="relative inline-block group">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl ring-4 ring-blue-50">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-20 h-20 text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => handleImageUpload('profile')}
                    className="absolute bottom-0 right-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 ring-4 ring-white"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900 tracking-tight">{personalInfo.fullName || 'Add Your Name'}</h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">ID: {personalInfo.emiratesId || 'Not Set'}</p>
              </div>

              <div className="mt-8 space-y-4">
                <div
                  className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border border-red-100/50 hover:border-red-200"
                  onClick={() => setIsEditingPersonal(true)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Blood Type</p>
                      <p className="text-lg font-bold text-gray-900">{personalInfo.bloodType || 'Not Set'}</p>
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
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Date of Birth</p>
                      <p className="text-lg font-bold text-gray-900">{personalInfo.dateOfBirth || 'Not Set'}</p>
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
                      <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Emergency Contact</p>
                      <p className="text-lg font-bold text-gray-900">{personalInfo.emergencyContactName || 'Not Set'}</p>
                      {personalInfo.emergencyContactPhone && (
                        <p className="text-sm text-gray-600 mt-1">{personalInfo.emergencyContactPhone}</p>
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
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Personal Information</h3>
                    <p className="text-blue-100 text-sm mt-1">Your basic details and health information</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {isEditingPersonal ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  <span>{isEditingPersonal ? 'Save Changes' : 'Edit Profile'}</span>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={!isEditingPersonal}
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Emirates ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={!isEditingPersonal}
                        value={personalInfo.emiratesId}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, emiratesId: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                        placeholder="784-XXXX-XXXXXXX-X"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Date of Birth</label>
                    <div className="relative group">
                      <input
                        type="date"
                        disabled={!isEditingPersonal}
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                      />
                      {!isEditingPersonal && (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Blood Type</label>
                    <div className="relative group">
                      <select
                        disabled={!isEditingPersonal}
                        value={personalInfo.bloodType}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, bloodType: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200 font-medium appearance-none bg-white"
                      >
                        <option value="">Select Blood Type</option>
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Allergies</label>
                    <textarea
                      disabled={!isEditingPersonal}
                      value={personalInfo.allergies}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, allergies: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200 resize-none font-medium"
                      placeholder="List any allergies (e.g., Penicillin, Peanuts, Latex)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Chronic Conditions</label>
                    <textarea
                      disabled={!isEditingPersonal}
                      value={personalInfo.chronicConditions}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, chronicConditions: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200 resize-none font-medium"
                      placeholder="List any chronic conditions (e.g., Diabetes, Hypertension, Asthma)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Emergency Contact Name</label>
                    <div className="relative group">
                      <input
                        type="text"
                        disabled={!isEditingPersonal}
                        value={personalInfo.emergencyContactName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                        placeholder="Contact person name"
                      />
                      {!isEditingPersonal && (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Emergency Contact Phone</label>
                    <div className="relative group">
                      <input
                        type="tel"
                        disabled={!isEditingPersonal}
                        value={personalInfo.emergencyContactPhone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactPhone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                        placeholder="+971 XX XXX XXXX"
                      />
                      {!isEditingPersonal && (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Emirates ID Documents</h3>
                    <p className="text-emerald-100 text-sm mt-1">Upload or scan your Emirates ID card</p>
                  </div>
                </div>
                <button
                  onClick={handleScanEmiratesId}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Camera className="w-5 h-5" />
                  <span>Scan ID</span>
                </button>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Front Side</label>
                    <div
                      onClick={() => handleImageUpload('emiratesFront')}
                      className="group relative border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300"
                    >
                      {emiratesIdFront ? (
                        <img src={emiratesIdFront} alt="Emirates ID Front" className="max-h-48 mx-auto rounded-xl shadow-lg" />
                      ) : (
                        <div className="space-y-3">
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-300">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 transition-colors duration-300" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">Front side of Emirates ID</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Back Side</label>
                    <div
                      onClick={() => handleImageUpload('emiratesBack')}
                      className="group relative border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300"
                    >
                      {emiratesIdBack ? (
                        <img src={emiratesIdBack} alt="Emirates ID Back" className="max-h-48 mx-auto rounded-xl shadow-lg" />
                      ) : (
                        <div className="space-y-3">
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-300">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 transition-colors duration-300" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">Back side of Emirates ID</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Insurance Information</h3>
                    <p className="text-violet-100 text-sm mt-1">Optional - Add your insurance details</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingInsurance(!isEditingInsurance)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {isEditingInsurance ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  <span>{isEditingInsurance ? 'Save Changes' : 'Edit Insurance'}</span>
                </button>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Insurance Provider</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.provider}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, provider: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                      placeholder="e.g., AXA, Daman, MetLife"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Policy Number</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.policyNumber}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, policyNumber: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                      placeholder="Policy number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Member ID</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.memberId}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, memberId: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                      placeholder="Member ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Group Number</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.groupNumber}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, groupNumber: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                      placeholder="Group number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Coverage Type</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.coverageType}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, coverageType: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                      placeholder="e.g., Premium, Basic, Gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Valid Until</label>
                    <input
                      type="date"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.validUntil}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, validUntil: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-gray-50 transition-all duration-200 font-medium"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Insurance Card Image</label>
                    <div
                      onClick={() => isEditingInsurance && handleImageUpload('insurance')}
                      className={`group border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center transition-all duration-300 ${isEditingInsurance ? 'cursor-pointer hover:border-violet-500 hover:bg-violet-50/50' : 'cursor-not-allowed opacity-75'}`}
                    >
                      {insuranceInfo.cardImage ? (
                        <img src={insuranceInfo.cardImage} alt="Insurance Card" className="max-h-48 mx-auto rounded-xl shadow-lg" />
                      ) : (
                        <div className="space-y-3">
                          <div className={`w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isEditingInsurance ? 'group-hover:bg-violet-100' : ''}`}>
                            <Upload className={`w-8 h-8 text-gray-400 transition-colors duration-300 ${isEditingInsurance ? 'group-hover:text-violet-600' : ''}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">Insurance card image (front or back)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Family Chart</h3>
                    <p className="text-orange-100 text-sm mt-1">Manage your family members' profiles</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddFamily(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Member</span>
                </button>
              </div>
              <div className="p-8">
                <FamilyTree
                  members={familyMembers}
                  primaryUser={{
                    name: personalInfo.fullName || 'You',
                    profileImage: profileImage,
                  }}
                />

                {familyMembers.length > 0 && (
                  <div className="mt-12 pt-8 border-t-2 border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-6 text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      Family Members List
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {familyMembers.map((member) => (
                        <div key={member.id} className="group border-2 border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-orange-200 transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
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
                                <h4 className="font-bold text-gray-900 text-lg">{member.name}</h4>
                                <p className="text-sm text-orange-600 font-medium">{member.relationship}</p>
                                {member.dateOfBirth && (
                                  <p className="text-xs text-gray-500 mt-1">{member.dateOfBirth}</p>
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
                    <h4 className="font-bold text-gray-900 mb-5 text-lg">Add Family Member</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={newFamilyMember.name || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white font-medium"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                        <select
                          value={newFamilyMember.relationship || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white font-medium"
                        >
                          <option value="">Select Relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={newFamilyMember.dateOfBirth || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, dateOfBirth: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Emirates ID</label>
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
                        Add Member
                      </button>
                      <button
                        onClick={() => {
                          setShowAddFamily(false);
                          setNewFamilyMember({});
                        }}
                        className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
