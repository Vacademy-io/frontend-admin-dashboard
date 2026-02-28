import React, { useState } from 'react';
import ComplexPaymentOptionsTab from './ComplexPaymentOptionsTab';
import FeeTypesTab from './FeeTypesTab';
import InstallmentsTab from './InstallmentsTab';

type Tab = 'cpos' | 'fee-types' | 'installments';

const TABS: { id: Tab; label: string }[] = [
    { id: 'cpos', label: 'Fee Packages' },
    { id: 'fee-types', label: 'Fee Types' },
    { id: 'installments', label: 'Installment Schedules' },
];

export default function FeeManagementV2Main() {
    const [activeTab, setActiveTab] = useState<Tab>('cpos');
    // Lifted state: selected CPO ID shared between Tab 1 and Tab 2
    const [jumpToCpoId, setJumpToCpoId] = useState<string | undefined>(undefined);

    const handleManageFeeTypes = (cpoId: string) => {
        setJumpToCpoId(cpoId);
        setActiveTab('fee-types');
    };

    return (
        <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Fee Management</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Configure fee packages, fee types, and installment schedules for your institute.
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto pr-1">
                {activeTab === 'cpos' && (
                    <ComplexPaymentOptionsTab onManageFeeTypes={handleManageFeeTypes} />
                )}
                {activeTab === 'fee-types' && <FeeTypesTab initialCpoId={jumpToCpoId} />}
                {activeTab === 'installments' && <InstallmentsTab />}
            </div>
        </div>
    );
}
