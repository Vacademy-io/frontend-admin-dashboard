import React from 'react';
import { Registration } from '../../../-types/registration-types';

interface SectionProps {
    formData: Partial<Registration>;
    updateFormData: (data: Partial<Registration>) => void;
}

export const AcademicInfoSection: React.FC<SectionProps> = ({ formData, updateFormData }) => {
    return (
        <div className="space-y-6">
            {/* Current/Previous School Details */}
            <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase text-neutral-500">
                    <span className="i-ph-graduation-cap size-4" />
                    Current / Previous School Details
                </h4>

                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Previous School Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Enter previous school name"
                        value={formData.previousSchoolName || ''}
                        onChange={(e) => updateFormData({ previousSchoolName: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Previous School Board <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.previousSchoolBoard || ''}
                            onChange={(e) =>
                                updateFormData({ previousSchoolBoard: e.target.value })
                            }
                        >
                            <option value="">Select board</option>
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="State Board">State Board</option>
                            <option value="IB">IB</option>
                            <option value="IGCSE">IGCSE</option>
                            <option value="Other">Other</option>
                        </select>
                        <p className="mt-1 text-xs text-neutral-500">CBSE / ICSE</p>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Last Class Attended <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.lastClassAttended || ''}
                            onChange={(e) => updateFormData({ lastClassAttended: e.target.value })}
                        >
                            <option value="">Select class</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
                                <option key={cls} value={cls.toString()}>
                                    Class {cls}
                                </option>
                            ))}
                            <option value="Kindergarten">Kindergarten</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Previous School Address
                    </label>
                    <textarea
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        rows={2}
                        placeholder="Enter previous school address"
                        value={formData.previousSchoolAddress || ''}
                        onChange={(e) => updateFormData({ previousSchoolAddress: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Medium of Instruction <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.mediumOfInstruction || ''}
                            onChange={(e) =>
                                updateFormData({ mediumOfInstruction: e.target.value })
                            }
                        >
                            <option value="">Select medium</option>
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Regional">Regional</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Academic Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.academicYear || ''}
                            onChange={(e) => updateFormData({ academicYear: e.target.value })}
                        >
                            <option value="">Select year</option>
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Last Exam Result / Percentage
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="E.g., 85% or A1 Grade or 9 CGPA"
                            value={formData.lastExamResult || ''}
                            onChange={(e) => updateFormData({ lastExamResult: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Subjects Studied (Previous Class)
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="E.g., English, Hindi, Maths, Science, Social Science"
                            value={formData.subjectsStudied || ''}
                            onChange={(e) => updateFormData({ subjectsStudied: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Transfer Certificate Details */}
            <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase text-neutral-500">
                    <span className="i-ph-file-text size-4" />
                    Transfer Certificate (TC) Details
                </h4>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            TC Number
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Enter TC number"
                            value={formData.tcNumber || ''}
                            onChange={(e) => updateFormData({ tcNumber: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            TC Issue Date
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.tcIssueDate || ''}
                            onChange={(e) => updateFormData({ tcIssueDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            className="mt-1 size-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            checked={formData.tcSubmittedLater || false}
                            onChange={(e) => updateFormData({ tcSubmittedLater: e.target.checked })}
                        />
                        <div>
                            <span className="block text-sm font-medium text-yellow-900">
                                TC will be submitted later
                            </span>
                            <span className="block text-xs text-yellow-700">
                                (Admission cannot be confirmed without TC)
                            </span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Applying For */}
            <div className="space-y-4 pt-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase text-neutral-500">
                    <span className="i-ph-student size-4" />
                    Applying For
                </h4>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Class / Grade Applying For <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.applyingForClass || ''}
                            onChange={(e) => updateFormData({ applyingForClass: e.target.value })}
                        >
                            <option value="">Select class</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
                                <option key={cls} value={cls.toString()}>
                                    Class {cls}
                                </option>
                            ))}
                            <option value="Kindergarten">Kindergarten</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Board Preference <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.preferredBoard || ''}
                            onChange={(e) => updateFormData({ preferredBoard: e.target.value })}
                        >
                            <option value="">Select board</option>
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="State Board">State Board</option>
                            <option value="IB">IB</option>
                            <option value="IGCSE">IGCSE</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Academic Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.academicYear || ''}
                            onChange={(e) => updateFormData({ academicYear: e.target.value })}
                        >
                            <option value="">Select year</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2026-2027">2026-2027</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sibling Information */}
            <div className="space-y-4 border-t border-neutral-200 pt-4">
                <h4 className="text-sm font-semibold uppercase text-neutral-500">
                    Sibling Information
                </h4>
                <div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="size-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            checked={formData.hasSiblingsInSchool || false}
                            onChange={(e) =>
                                updateFormData({ hasSiblingsInSchool: e.target.checked })
                            }
                        />
                        <span className="text-sm text-neutral-700">
                            Sibling currently studying in this school
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};
