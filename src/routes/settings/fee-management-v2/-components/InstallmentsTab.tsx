import React, { useState } from 'react';
import { MOCK_CPOS, MOCK_FEE_TYPES, MOCK_AFVS, MOCK_INSTALLMENTS } from '../-data/mockData';

export default function InstallmentsTab() {
    const [selectedCpoId, setSelectedCpoId] = useState(MOCK_CPOS[0]?.id ?? '');
    const [selectedFeeTypeId, setSelectedFeeTypeId] = useState('');

    const feeTypesForCpo = MOCK_FEE_TYPES.filter((f) => f.cpo_id === selectedCpoId);

    // Set default fee type when CPO changes
    const handleCpoChange = (cpoId: string) => {
        setSelectedCpoId(cpoId);
        const types = MOCK_FEE_TYPES.filter((f) => f.cpo_id === cpoId);
        setSelectedFeeTypeId(types[0]?.id ?? '');
    };

    // Initialize with first fee type of first CPO
    useState(() => {
        if (!selectedFeeTypeId && feeTypesForCpo.length > 0) {
            setSelectedFeeTypeId(feeTypesForCpo[0]!.id);
        }
    });

    const afv = MOCK_AFVS.find((a) => a.fee_type_id === selectedFeeTypeId);
    const installments = afv
        ? MOCK_INSTALLMENTS.filter((i) => i.assigned_fee_value_id === afv.id)
        : [];

    const feeType = MOCK_FEE_TYPES.find((f) => f.id === selectedFeeTypeId);

    return (
        <div className="flex flex-col gap-6 duration-300 animate-in fade-in">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                        Fee Package:
                    </span>
                    <select
                        value={selectedCpoId}
                        onChange={(e) => handleCpoChange(e.target.value)}
                        className="w-52 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-600 focus:ring-blue-600"
                    >
                        {MOCK_CPOS.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                        Fee Type:
                    </span>
                    <select
                        value={selectedFeeTypeId}
                        onChange={(e) => setSelectedFeeTypeId(e.target.value)}
                        className="w-52 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-600 focus:ring-blue-600"
                    >
                        <option value="">— Select —</option>
                        {feeTypesForCpo.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* AFV Summary Card */}
            {afv && feeType ? (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                Total Amount
                            </p>
                            <p className="text-xl font-bold text-gray-800">
                                ₹{afv.amount.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                Installments
                            </p>
                            <p className="text-xl font-bold text-gray-800">{installments.length}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                Refundable
                            </p>
                            <p
                                className={`mt-1 text-sm font-semibold ${afv.is_refundable ? 'text-green-600' : 'text-gray-400'}`}
                            >
                                {afv.is_refundable ? '✓ Yes' : '✗ No'}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                Penalty
                            </p>
                            <p
                                className={`mt-1 text-sm font-semibold ${afv.has_penalty ? 'text-amber-600' : 'text-gray-400'}`}
                            >
                                {afv.has_penalty ? `${afv.penalty_percentage}%` : '✗ None'}
                            </p>
                        </div>
                    </div>

                    {/* Installments Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full border-collapse bg-white text-left">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">
                                        Due Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {installments.map((inst) => (
                                    <tr
                                        key={inst.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-500">
                                            {inst.installment_number}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            ₹{inst.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(inst.due_date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                                {installments.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-gray-400">
                                            No installment schedule defined for this fee type.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                    <svg
                        className="h-10 w-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <p className="text-sm">
                        Select a fee package and fee type to view its installment schedule.
                    </p>
                </div>
            )}
        </div>
    );
}
