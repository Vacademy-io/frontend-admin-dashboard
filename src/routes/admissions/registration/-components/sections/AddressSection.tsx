import React from 'react';
import { Registration, AddressInfo } from '../../../-types/registration-types';
import { MapPin, Bus, Buildings } from '@phosphor-icons/react';

interface SectionProps {
    formData: Partial<Registration>;
    updateFormData: (data: Partial<Registration>) => void;
}

export const AddressSection: React.FC<SectionProps> = ({ formData, updateFormData }) => {
    const [sameAsCurrent, setSameAsCurrent] = React.useState(false);

    const updateAddress = (
        type: 'currentAddress' | 'permanentAddress',
        field: keyof AddressInfo,
        value: string
    ) => {
        const currentAddress = formData[type] || {
            city: '',
            state: '',
            pinCode: '',
            country: 'India',
        };
        const updatedAddress = {
            ...currentAddress,
            [field]: value,
        } as AddressInfo;

        const updates: Partial<Registration> = {
            [type]: updatedAddress as AddressInfo,
        };

        if (type === 'currentAddress' && sameAsCurrent) {
            updates.permanentAddress = updatedAddress;
        }

        updateFormData(updates);
    };

    const handleSameAsCurrentChange = (checked: boolean) => {
        setSameAsCurrent(checked);
        if (checked) {
            updateFormData({
                permanentAddress: formData.currentAddress,
            });
        }
    };

    const renderAddressForm = (
        type: 'currentAddress' | 'permanentAddress',
        title: string,
        disabled: boolean = false
    ) => {
        const data: Partial<AddressInfo> = formData[type] || {};
        const updateField = (field: keyof AddressInfo, value: string) =>
            updateAddress(type, field, value);

        return (
            <div className="space-y-4 pt-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase text-neutral-500">
                    <MapPin className="size-4" />
                    {title}
                </h4>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            House No / Flat No / Building Name{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                            placeholder="e.g., 12-A, Sunrise Apartments"
                            value={data.houseNo || ''}
                            onChange={(e) => updateField('houseNo', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Street / Road Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                            placeholder="e.g., M.G. Road"
                            value={data.street || ''}
                            onChange={(e) => updateField('street', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Area / Locality / Sector <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                            placeholder="e.g., Arera Colony"
                            value={data.area || ''}
                            onChange={(e) => updateField('area', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Landmark
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                            placeholder="e.g., Near City Mall"
                            value={data.landmark || ''}
                            onChange={(e) => updateField('landmark', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                                placeholder="e.g., Bhopal"
                                value={data.city || ''}
                                onChange={(e) => updateField('city', e.target.value)}
                                disabled={disabled}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700">
                                State <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                                value={data.state || ''}
                                onChange={(e) => updateField('state', e.target.value)}
                                disabled={disabled}
                            >
                                <option value="">Select state</option>
                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Delhi">Delhi</option>
                                {/* Add more states as needed */}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            PIN Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                            placeholder="e.g., 462001"
                            value={data.pinCode || ''}
                            onChange={(e) => {
                                updateField('pinCode', e.target.value);
                                updateField('pincode', e.target.value);
                            }}
                            disabled={disabled}
                        />
                        <p className="mt-1 text-xs text-neutral-500">6 digits</p>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                            Country
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                            value={data.country || 'India'}
                            onChange={(e) => updateField('country', e.target.value)}
                            disabled={disabled}
                        >
                            <option value="India">India</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {renderAddressForm('currentAddress', 'Residential Address (Current)')}

                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            className="size-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            checked={sameAsCurrent}
                            onChange={(e) => handleSameAsCurrentChange(e.target.checked)}
                        />
                        <span className="text-sm font-medium text-neutral-900">
                            Permanent Address is same as Residential Address
                        </span>
                    </label>
                </div>

                {!sameAsCurrent && renderAddressForm('permanentAddress', 'Permanent Address')}
            </div>

            {/* Additional Requirements */}
            <div className="space-y-4 border-t border-neutral-200 pt-4">
                <h4 className="text-sm font-semibold uppercase text-neutral-500">
                    Additional Requirements
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Transport */}
                    <div className="rounded-lg border border-neutral-200 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Bus className="size-5 text-orange-500" />
                            <span className="font-medium text-neutral-700">
                                Transport Required? <span className="text-red-500">*</span>
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="transportRequired"
                                    className="size-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.transportRequired === true}
                                    onChange={() => updateFormData({ transportRequired: true })}
                                />
                                <span className="text-sm text-neutral-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="transportRequired"
                                    className="size-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.transportRequired === false}
                                    onChange={() => updateFormData({ transportRequired: false })}
                                />
                                <span className="text-sm text-neutral-700">No</span>
                            </label>
                        </div>
                    </div>

                    {/* Hostel */}
                    <div className="rounded-lg border border-neutral-200 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Buildings className="size-5 text-orange-500" />
                            <span className="font-medium text-neutral-700">
                                Hostel Required? <span className="text-red-500">*</span>
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="hostelRequired"
                                    className="size-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.hostelRequired === true}
                                    onChange={() => updateFormData({ hostelRequired: true })}
                                />
                                <span className="text-sm text-neutral-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="hostelRequired"
                                    className="size-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.hostelRequired === false}
                                    onChange={() => updateFormData({ hostelRequired: false })}
                                />
                                <span className="text-sm text-neutral-700">No</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
