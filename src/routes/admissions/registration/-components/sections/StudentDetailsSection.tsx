import React from 'react';
import { Registration } from '../../../-types/registration-types';

interface SectionProps {
    formData: Partial<Registration>;
    updateFormData: (data: Partial<Registration>) => void;
}

export const StudentDetailsSection: React.FC<SectionProps> = ({ formData, updateFormData }) => {
    return (
        <div className="space-y-6">
            {/* Registration Details (Read Only) */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500">
                    <span className="i-ph-info-circle size-4" />
                    Registration Details
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                        <span className="block text-xs text-neutral-500">Registration ID</span>
                        <span className="text-sm font-medium text-orange-600">{formData.id}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-neutral-500">Inquiry ID</span>
                        <span className="text-sm font-medium text-neutral-900">
                            {formData.inquiryId || '–'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-neutral-500">Registration Date</span>
                        <span className="text-sm font-medium text-neutral-900">
                            {new Date().toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-neutral-500">
                    Basic Information
                </h4>

                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Full Name <span className="text-red-500">*</span> (As per Birth Certificate)
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Enter student's full name"
                        value={formData.studentName || ''}
                        onChange={(e) => updateFormData({ studentName: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.dateOfBirth || ''}
                            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4 pt-2">
                            {['MALE', 'FEMALE', 'OTHER'].map((gender) => (
                                <label key={gender} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="gender"
                                        className="size-4 text-primary-600 focus:ring-primary-500"
                                        checked={formData.gender === gender}
                                        onChange={() => updateFormData({ gender: gender as any })}
                                    />
                                    <span className="text-sm text-neutral-700">
                                        {gender.charAt(0) + gender.slice(1).toLowerCase()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Demographics */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-neutral-500">Demographics</h4>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Nationality <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.nationality || 'Indian'}
                            onChange={(e) => updateFormData({ nationality: e.target.value })}
                        >
                            <option value="Indian">Indian</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Religion
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.religion || ''}
                            onChange={(e) => updateFormData({ religion: e.target.value })}
                        >
                            <option value="">Select</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Muslim">Muslim</option>
                            <option value="Christian">Christian</option>
                            <option value="Sikh">Sikh</option>
                            <option value="Jain">Jain</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.category || ''}
                            onChange={(e) => updateFormData({ category: e.target.value })}
                        >
                            <option value="">Select</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="EWS">EWS</option>
                        </select>
                        <p className="mt-1 text-xs text-neutral-500">(General/OBC/SC/ST/EWS)</p>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Blood Group
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.bloodGroup || ''}
                            onChange={(e) => updateFormData({ bloodGroup: e.target.value })}
                        >
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                        </select>
                        <p className="mt-1 text-xs text-neutral-500">(A+/A-/B+/B-/O+/O-/AB+/AB-)</p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Mother Tongue
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.motherTongue || ''}
                            onChange={(e) => updateFormData({ motherTongue: e.target.value })}
                        >
                            <option value="">Select</option>
                            <option value="Hindi">Hindi</option>
                            <option value="English">English</option>
                            <option value="Gujarati">Gujarati</option>
                            <option value="Marathi">Marathi</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Languages Known
                        </label>
                        <div className="flex gap-4 pt-2">
                            {['Hindi', 'English', 'Regional'].map((lang) => (
                                <label key={lang} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="size-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                        // Simple logic for this specific requirement
                                    />
                                    <span className="text-sm text-neutral-700">{lang}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Identification */}
            <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase text-neutral-500">
                    <span className="i-ph-identification-card size-4" />
                    Identification
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Aadhaar Number (Optional)
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="XXXX XXXX XXXX"
                            value={formData.aadhaarNumber || ''}
                            onChange={(e) => updateFormData({ aadhaarNumber: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Birth Certificate Number
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Enter birth certificate number"
                            value={formData.birthCertificateNumber || ''}
                            onChange={(e) =>
                                updateFormData({ birthCertificateNumber: e.target.value })
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Special Requirements */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase text-neutral-500">
                    Special Requirements
                </h4>

                <div className="space-y-4 rounded-lg border border-neutral-200 p-4">
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            className="mt-1 size-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            checked={formData.hasSpecialNeeds || false}
                            onChange={(e) => updateFormData({ hasSpecialNeeds: e.target.checked })}
                        />
                        <div>
                            <span className="block text-sm font-medium text-neutral-900">
                                Student has special educational needs
                            </span>
                            <span className="block text-xs text-neutral-500">
                                Learning disability, ADHD, Autism, etc.
                            </span>
                        </div>
                    </label>

                    {formData.hasSpecialNeeds && (
                        <textarea
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            rows={2}
                            placeholder="Please provide details..."
                            value={formData.specialNeedsDetails || ''}
                            onChange={(e) =>
                                updateFormData({ specialNeedsDetails: e.target.value })
                            }
                        />
                    )}

                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            className="mt-1 size-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            checked={formData.isPhysicallyChallenged || false}
                            onChange={(e) =>
                                updateFormData({ isPhysicallyChallenged: e.target.checked })
                            }
                        />
                        <div>
                            <span className="block text-sm font-medium text-neutral-900">
                                Student is physically challenged
                            </span>
                        </div>
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Medical Conditions / Allergies (if any)
                        </label>
                        <textarea
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            rows={3}
                            placeholder="E.g., Asthma, Diabetes, Food allergies, etc."
                            value={formData.medicalConditions || ''}
                            onChange={(e) => updateFormData({ medicalConditions: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Dietary Restrictions
                        </label>
                        <textarea
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            rows={3}
                            placeholder="E.g., Vegetarian, No nuts, etc."
                            value={formData.dietaryRestrictions || ''}
                            onChange={(e) =>
                                updateFormData({ dietaryRestrictions: e.target.value })
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
