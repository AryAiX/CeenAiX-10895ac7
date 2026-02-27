import React, { useState } from 'react';
import { Navigation } from '../../components/Navigation';
import { Upload, Camera, User, Shield, Users, Plus, Trash2, Edit2, Save } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navigation role="patient" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and health records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-blue-500" />
                    )}
                  </div>
                  <button
                    onClick={() => handleImageUpload('profile')}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{personalInfo.fullName || 'Add Your Name'}</h2>
                <p className="text-gray-600 text-sm">Patient ID: {personalInfo.emiratesId || 'Not Set'}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Blood Type</p>
                  <p className="font-semibold text-gray-900">{personalInfo.bloodType || 'Not Set'}</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold text-gray-900">{personalInfo.dateOfBirth || 'Not Set'}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Emergency Contact</p>
                  <p className="font-semibold text-gray-900">{personalInfo.emergencyContactName || 'Not Set'}</p>
                  <p className="text-sm text-gray-600">{personalInfo.emergencyContactPhone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                </div>
                <button
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {isEditingPersonal ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  <span>{isEditingPersonal ? 'Save' : 'Edit'}</span>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      disabled={!isEditingPersonal}
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emirates ID</label>
                    <input
                      type="text"
                      disabled={!isEditingPersonal}
                      value={personalInfo.emiratesId}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, emiratesId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      disabled={!isEditingPersonal}
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                    <select
                      disabled={!isEditingPersonal}
                      value={personalInfo.bloodType}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, bloodType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <textarea
                      disabled={!isEditingPersonal}
                      value={personalInfo.allergies}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, allergies: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="List any allergies (e.g., Penicillin, Peanuts)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
                    <textarea
                      disabled={!isEditingPersonal}
                      value={personalInfo.chronicConditions}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, chronicConditions: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="List any chronic conditions (e.g., Diabetes, Hypertension)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                    <input
                      type="text"
                      disabled={!isEditingPersonal}
                      value={personalInfo.emergencyContactName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      disabled={!isEditingPersonal}
                      value={personalInfo.emergencyContactPhone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Camera className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Emirates ID Documents</h3>
                </div>
                <button
                  onClick={handleScanEmiratesId}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan ID</span>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Front Side</label>
                    <div
                      onClick={() => handleImageUpload('emiratesFront')}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                    >
                      {emiratesIdFront ? (
                        <img src={emiratesIdFront} alt="Emirates ID Front" className="max-h-40 mx-auto rounded" />
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload front side</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Back Side</label>
                    <div
                      onClick={() => handleImageUpload('emiratesBack')}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                    >
                      {emiratesIdBack ? (
                        <img src={emiratesIdBack} alt="Emirates ID Back" className="max-h-40 mx-auto rounded" />
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload back side</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Insurance Information</h3>
                    <p className="text-sm text-gray-600">Optional</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingInsurance(!isEditingInsurance)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  {isEditingInsurance ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  <span>{isEditingInsurance ? 'Save' : 'Edit'}</span>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.provider}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, provider: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.policyNumber}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, policyNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member ID</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.memberId}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, memberId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Number</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.groupNumber}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, groupNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Type</label>
                    <input
                      type="text"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.coverageType}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, coverageType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="e.g., Premium, Basic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      disabled={!isEditingInsurance}
                      value={insuranceInfo.validUntil}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, validUntil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Insurance Card Image</label>
                    <div
                      onClick={() => isEditingInsurance && handleImageUpload('insurance')}
                      className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${isEditingInsurance ? 'cursor-pointer hover:border-purple-500 hover:bg-purple-50' : 'cursor-not-allowed'} transition-all`}
                    >
                      {insuranceInfo.cardImage ? (
                        <img src={insuranceInfo.cardImage} alt="Insurance Card" className="max-h-40 mx-auto rounded" />
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload insurance card</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Family Chart</h3>
                </div>
                <button
                  onClick={() => setShowAddFamily(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>
              <div className="p-6">
                {familyMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No family members added yet</p>
                    <p className="text-sm">Add your family members to manage their health records</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyMembers.map((member) => (
                      <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                              {member.profileImage ? (
                                <img src={member.profileImage} alt={member.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.relationship}</p>
                              <p className="text-xs text-gray-500">{member.dateOfBirth}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFamilyMember(member.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAddFamily && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Add Family Member</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={newFamilyMember.name || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                        <select
                          value={newFamilyMember.relationship || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={newFamilyMember.dateOfBirth || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, dateOfBirth: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emirates ID</label>
                        <input
                          type="text"
                          value={newFamilyMember.emiratesId || ''}
                          onChange={(e) => setNewFamilyMember({ ...newFamilyMember, emiratesId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={addFamilyMember}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Add Member
                      </button>
                      <button
                        onClick={() => {
                          setShowAddFamily(false);
                          setNewFamilyMember({});
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
