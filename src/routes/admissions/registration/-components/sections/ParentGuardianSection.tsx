import React from 'react';
import { Registration } from '../../../-types/registration-types';

interface SectionProps {
    formData: Partial<Registration>;
    updateFormData: (data: Partial<Registration>) => void;
}

export const ParentGuardianSection: React.FC<SectionProps> = ({ formData, updateFormData }) => {
    const [activeTab, setActiveTab] = React.useState<'FATHER' | 'MOTHER' | 'GUARDIAN'>('FATHER');

    const updateParentInfo = (
        parentType: 'fatherInfo' | 'motherInfo' | 'guardianInfo',
        field: string,
        value: string
    ) => {
        const currentInfo = (formData[parentType] as any) || {};
        updateFormData({
            [parentType]: {
                ...currentInfo,
                [field]: value,
            },
        });
    };

    const renderField = (
        label: string,
        value: string,
        onChange: (val: string) => void,
        placeholder: string = '',
        required: boolean = false,
        type: string = 'text',
        options?: string[]
    ) => (
        <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {options ? (
                <select
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">Select</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
        </div>
    );

    const renderParentForm = (
        type: 'fatherInfo' | 'motherInfo' | 'guardianInfo',
        title: string
    ) => {
        const data = (formData[type] as any) || {};

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {renderField(
                        'Full Name',
                        data.name || '',
                        (v) => updateParentInfo(type, 'name', v),
                        `${title}'s full name`,
                        true
                    )}
                    {renderField(
                        'Mobile Number',
                        data.mobile || '',
                        (v) => updateParentInfo(type, 'mobile', v),
                        '+91 XXXXX XXXXX',
                        true,
                        'tel'
                    )}
                    {renderField(
                        'Alternate Mobile',
                        data.alternateMobile || '',
                        (v) => updateParentInfo(type, 'alternateMobile', v),
                        '+91 XXXXX XXXXX',
                        false,
                        'tel'
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {renderField(
                        'Email Address',
                        data.email || '',
                        (v) => updateParentInfo(type, 'email', v),
                        'example@email.com',
                        type === 'fatherInfo',
                        'email'
                    )}
                    {renderField(
                        'Qualification',
                        data.qualification || '',
                        (v) => updateParentInfo(type, 'qualification', v),
                        'Select',
                        true,
                        'text',
                        ['Post Graduate', 'Graduate', 'High School', 'Others']
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {renderField(
                        'Occupation',
                        data.occupation || '',
                        (v) => updateParentInfo(type, 'occupation', v),
                        'Select',
                        true,
                        'text',
                        ['Salaried', 'Self Employed', 'Business', 'Others', 'Homemaker']
                    )}
                    {renderField(
                        'Organization',
                        data.organization || '',
                        (v) => updateParentInfo(type, 'organization', v),
                        'Company name'
                    )}
                    {renderField(
                        'Designation',
                        data.designation || '',
                        (v) => updateParentInfo(type, 'designation', v),
                        'Job title'
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {renderField(
                        'Annual Income',
                        data.annualIncome || '',
                        (v) => updateParentInfo(type, 'annualIncome', v),
                        'Select',
                        true,
                        'text',
                        ['< 1 Lakh', '1-5 Lakh', '5-10 Lakh', '> 10 Lakh']
                    )}
                    {renderField(
                        'Aadhaar Number',
                        data.aadharNumber || '',
                        (v) => updateParentInfo(type, 'aadharNumber', v),
                        'XXXX XXXX XXXX'
                    )}
                    {renderField(
                        'PAN Number',
                        data.panNumber || '',
                        (v) => updateParentInfo(type, 'panNumber', v),
                        'ABCDE1234F'
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {renderField(
                        'Office Address',
                        data.officeAddress || '',
                        (v) => updateParentInfo(type, 'officeAddress', v),
                        'Full office address'
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-neutral-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'FATHER', name: 'Father Details' },
                        { id: 'MOTHER', name: 'Mother Details' },
                        { id: 'GUARDIAN', name: 'Guardian Details' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium
                                ${
                                    activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                                }
                            `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-4">
                {activeTab === 'FATHER' && renderParentForm('fatherInfo', 'Father')}
                {activeTab === 'MOTHER' && renderParentForm('motherInfo', 'Mother')}
                {activeTab === 'GUARDIAN' && renderParentForm('guardianInfo', 'Guardian')}
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4 border-t border-neutral-200 pt-6">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase text-neutral-500">
                    <span className="i-ph-phone size-4" />
                    Emergency Contact
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {renderField(
                        'Contact Person',
                        formData.emergencyContact?.name || '',
                        (v) =>
                            updateFormData({
                                emergencyContact: { ...formData.emergencyContact!, name: v },
                            }),
                        'Full name',
                        true
                    )}
                    {renderField(
                        'Relationship',
                        formData.emergencyContact?.relationship || '',
                        (v) =>
                            updateFormData({
                                emergencyContact: {
                                    ...formData.emergencyContact!,
                                    relationship: v,
                                },
                            }),
                        'Select',
                        true,
                        'text',
                        ['Grandparent', 'Uncle', 'Aunt', 'Brother', 'Sister', 'Other']
                    )}
                    {renderField(
                        'Mobile',
                        formData.emergencyContact?.mobile || '',
                        (v) =>
                            updateFormData({
                                emergencyContact: { ...formData.emergencyContact!, mobile: v },
                            }),
                        '+91 XXXXX',
                        true,
                        'tel'
                    )}
                    {renderField(
                        'Alternate No.',
                        formData.emergencyContact?.alternateMobile || '',
                        (v) =>
                            updateFormData({
                                emergencyContact: {
                                    ...formData.emergencyContact!,
                                    alternateMobile: v,
                                },
                            }),
                        '+91 XXXXX'
                    )}
                </div>
            </div>
        </div>
    );
};
