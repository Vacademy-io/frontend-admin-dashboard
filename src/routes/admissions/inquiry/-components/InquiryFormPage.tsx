import { useState, useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { Helmet } from 'react-helmet';
import { MyButton } from '@/components/design-system/button';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { X, Info } from '@phosphor-icons/react';

// Types for New Enquiry Form configuration
interface EnquiryFormData {
    enquiryName: string;
    session: string;
    enquiryType: string;
    enquiryObjective: string;
    teamNotifications: string;
    notifyRespondent: boolean;
    description: string;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Inactive';
    addSettings: boolean;
}

export function InquiryFormPage({ onClose }: { onClose?: () => void }) {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<EnquiryFormData>({
        enquiryName: '',
        session: '',
        enquiryType: '',
        enquiryObjective: '',
        teamNotifications: '',
        notifyRespondent: false,
        description: '',
        startDate: '2026-01-30', // Example default or empty
        endDate: '2026-02-06',
        status: 'Active',
        addSettings: false,
    });

    useEffect(() => {
        if (!onClose) {
            setNavHeading(
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Create Enquiry</span>
                </div>
            );
        }
    }, [setNavHeading, onClose]);

    const updateFormData = (data: Partial<EnquiryFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const handleSave = async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Created Enquiry:', formData);
        if (onClose) {
            onClose();
        } else {
            navigate({ to: '/admissions/inquiry' });
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate({ to: '/admissions/inquiry' });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <Helmet>
                <title>Create Enquiry - Admissions</title>
            </Helmet>

            <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg ring-1 ring-black/5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                    <h2 className="text-lg font-semibold text-neutral-900">Create Enquiry</h2>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Enquiry Name */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700">
                                Enquiry Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="Enter enquiry name"
                                value={formData.enquiryName}
                                onChange={(e) => updateFormData({ enquiryName: e.target.value })}
                            />
                        </div>

                        {/* Session */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700">
                                Session <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={formData.session}
                                onChange={(e) => updateFormData({ session: e.target.value })}
                            >
                                <option value="">Select a session</option>
                                <option value="2025-2026">2025-2026</option>
                                <option value="2026-2027">2026-2027</option>
                            </select>
                        </div>

                        {/* Type & Objective */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                    Enquiry Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    value={formData.enquiryType}
                                    onChange={(e) =>
                                        updateFormData({ enquiryType: e.target.value })
                                    }
                                >
                                    <option value="">Select enquiry type</option>
                                    <option value="Website">Website</option>
                                    <option value="Walk-in">Walk-in</option>
                                    <option value="Phone Call">Phone Call</option>
                                    <option value="Email">Email</option>
                                    <option value="Social Media">Social Media</option>
                                    <option
                                        value="add_custom"
                                        className="font-medium text-primary-600"
                                    >
                                        + Add custom campaign type
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                    Enquiry Objective
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    placeholder="e.g., Admission, Information"
                                    value={formData.enquiryObjective}
                                    onChange={(e) =>
                                        updateFormData({ enquiryObjective: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* Notifications Group */}
                        <div className="rounded-lg border border-neutral-200 p-4">
                            <div className="mb-4">
                                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-700">
                                    Team Notifications{' '}
                                    <Info size={16} className="text-neutral-400" />
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    placeholder="Enter email & press Enter"
                                    value={formData.teamNotifications}
                                    onChange={(e) =>
                                        updateFormData({ teamNotifications: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                    Notify Respondent{' '}
                                    <Info size={16} className="text-neutral-400" />
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateFormData({
                                            notifyRespondent: !formData.notifyRespondent,
                                        })
                                    }
                                    className={cn(
                                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                                        formData.notifyRespondent ? 'bg-red-400' : 'bg-neutral-200'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                            formData.notifyRespondent
                                                ? 'translate-x-5'
                                                : 'translate-x-0'
                                        )}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700">
                                Enquiry Description
                            </label>
                            <textarea
                                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                rows={3}
                                placeholder="Describe the enquiry's purpose and target audience"
                                value={formData.description}
                                onChange={(e) => updateFormData({ description: e.target.value })}
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        value={formData.startDate}
                                        onChange={(e) =>
                                            updateFormData({ startDate: e.target.value })
                                        }
                                    />
                                    {/* <CalendarBlank size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" /> */}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        value={formData.endDate}
                                        onChange={(e) =>
                                            updateFormData({ endDate: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-700">
                                Status <Info size={16} className="text-neutral-400" />
                            </label>
                            <select
                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={formData.status}
                                onChange={(e) =>
                                    updateFormData({
                                        status: e.target.value as EnquiryFormData['status'],
                                    })
                                }
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Enquiry Form Fields Placeholder */}
                        <div className="rounded-lg border border-neutral-200 p-6">
                            <h3 className="mb-1 text-lg font-semibold text-neutral-900">
                                Enquiry Form Fields
                            </h3>
                            <p className="mb-6 text-sm text-neutral-500">
                                Configure fields from Custom Field Settings
                            </p>

                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-8 text-center">
                                <p className="text-sm text-neutral-600">
                                    No custom fields with &quot;Enquiry&quot; location enabled.
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">
                                    Go to Settings → Custom Fields to enable fields for Enquiry
                                    location.
                                </p>
                            </div>
                        </div>

                        {/* Add Settings */}
                        <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
                            <span className="text-base font-medium text-neutral-900">
                                Add Settings
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    updateFormData({ addSettings: !formData.addSettings })
                                }
                                className={cn(
                                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                                    formData.addSettings ? 'bg-red-400' : 'bg-neutral-200'
                                )}
                            >
                                <span
                                    className={cn(
                                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                        formData.addSettings ? 'translate-x-5' : 'translate-x-0'
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4">
                    <MyButton
                        buttonType="secondary"
                        onClick={() =>
                            setFormData((prev) => ({ ...prev, enquiryName: '', description: '' }))
                        } // Simple reset
                    >
                        Reset
                    </MyButton>
                    <MyButton
                        buttonType="primary"
                        onClick={handleSave}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Create Enquiry
                    </MyButton>
                </div>
            </div>
        </div>
    );
}
