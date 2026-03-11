// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useCPOOptions } from '../-services/cpo-service';
import type { CPOPackage, CPOFeeType } from '../-types/cpo-types';
import CreateCPODialog from './CreateCPODialog';

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const isActive = status === 'ACTIVE';
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isActive
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-yellow-500'}`}
            />
            {status}
        </span>
    );
}

function FeeTypeCard({
    feeType,
    isExpanded,
    onToggle,
}: {
    feeType: CPOFeeType;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const { assignedFeeValue } = feeType;
    const hasInstallments =
        assignedFeeValue.hasInstallment && assignedFeeValue.installments.length > 0;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Fee Type Header */}
            <div
                onClick={onToggle}
                className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div>
                        <div className="font-semibold text-sm text-gray-900">
                            {feeType.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {feeType.code} · {feeType.description}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-bold text-sm text-gray-800">
                            ₹{assignedFeeValue.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500">
                            {assignedFeeValue.noOfInstallments} installment
                            {assignedFeeValue.noOfInstallments !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {assignedFeeValue.isRefundable && (
                            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md font-medium">
                                Refundable
                            </span>
                        )}
                        {assignedFeeValue.hasPenalty && (
                            <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md font-medium">
                                Penalty {assignedFeeValue.penaltyPercentage}%
                            </span>
                        )}
                    </div>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

            {/* Installment Details */}
            {isExpanded && hasInstallments && (
                <div className="px-4 py-3">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                                    #
                                </th>
                                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                                    Due Date
                                </th>
                                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedFeeValue.installments.map((inst) => (
                                <tr
                                    key={inst.id}
                                    className="border-b border-gray-50"
                                >
                                    <td className="py-2 px-2 text-gray-500 font-medium">
                                        {inst.installmentNumber}
                                    </td>
                                    <td className="py-2 px-2 font-semibold text-gray-800">
                                        ₹{inst.amount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-2 px-2 text-gray-600">
                                        {new Date(inst.dueDate).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td className="py-2 px-2">
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                                                inst.status === 'PAID'
                                                    ? 'bg-green-50 text-green-700'
                                                    : inst.status === 'PENDING'
                                                      ? 'bg-amber-50 text-amber-700'
                                                      : 'bg-gray-50 text-gray-600'
                                            }`}
                                        >
                                            {inst.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50">
                                <td className="py-2 px-2 font-bold text-gray-700">
                                    Total
                                </td>
                                <td className="py-2 px-2 font-bold text-gray-800">
                                    ₹
                                    {assignedFeeValue.installments
                                        .reduce((sum, i) => sum + i.amount, 0)
                                        .toLocaleString('en-IN')}
                                </td>
                                <td colSpan={2} />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {isExpanded && !hasInstallments && (
                <div className="px-4 py-3 text-sm text-gray-500">
                    No installment schedule — one-time payment of ₹
                    {assignedFeeValue.amount.toLocaleString('en-IN')}
                </div>
            )}
        </div>
    );
}

function PackageCard({
    pkg,
    isSelected,
    onSelect,
}: {
    pkg: CPOPackage;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const [expandedFeeTypes, setExpandedFeeTypes] = useState<Set<string>>(new Set());

    const totalAmount = pkg.feeTypes.reduce(
        (sum, ft) => sum + ft.assignedFeeValue.amount,
        0
    );

    const toggleFeeType = (id: string) => {
        setExpandedFeeTypes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div
            className={`border rounded-xl overflow-hidden transition-all ${
                isSelected
                    ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md'
                    : 'border-gray-200 shadow-sm hover:shadow-md'
            }`}
        >
            {/* Package Header */}
            <div className="px-5 py-4 bg-white flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-base text-gray-900">
                            {pkg.name}
                        </h3>
                        <StatusBadge status={pkg.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                        <span>
                            <span className="font-semibold text-gray-700">
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </span>{' '}
                            total
                        </span>
                        <span>·</span>
                        <span>
                            {pkg.feeTypes.length} fee type
                            {pkg.feeTypes.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onSelect}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                        isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {isSelected ? 'Selected' : 'Select Package'}
                </button>
            </div>

            {/* Fee Types List */}
            <div className="px-5 pb-4 flex flex-col gap-2">
                {pkg.feeTypes.map((ft) => (
                    <FeeTypeCard
                        key={ft.id}
                        feeType={ft}
                        isExpanded={expandedFeeTypes.has(ft.id)}
                        onToggle={() => toggleFeeType(ft.id)}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function InstallmentPlansTab() {
    const [selectedPackageSessionId, setSelectedPackageSessionId] = useState<string | null>(
        null
    );
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Get batches (classes) from institute store
    const instituteDetails = useInstituteDetailsStore((s) => s.instituteDetails);
    const batches = useMemo(() => {
        return instituteDetails?.batches_for_sessions ?? [];
    }, [instituteDetails]);

    // Group batches by session for the dropdown
    const batchOptions = useMemo(() => {
        return batches.map((batch) => ({
            id: batch.id,
            label: `${batch.package_dto.package_name} - ${batch.level.level_name} (${batch.session.session_name})`,
            levelName: batch.level.level_name,
            sessionName: batch.session.session_name,
            packageName: batch.package_dto.package_name,
        }));
    }, [batches]);

    // Fetch CPO options for selected class
    const { data: cpoPackages, isLoading, isError, error } = useCPOOptions(selectedPackageSessionId);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Fee Packages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Select a class to view available fee packages with their fee types and
                        installment schedules.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateDialog(true)}
                    className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition cursor-pointer shadow-md"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Package
                </button>
            </div>

            {/* Class Selector */}
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-lg">
                <div className="flex-1 max-w-md">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Select Class / Batch
                    </label>
                    <select
                        value={selectedPackageSessionId ?? ''}
                        onChange={(e) => {
                            setSelectedPackageSessionId(e.target.value || null);
                            setSelectedPackageId(null);
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition cursor-pointer bg-white"
                    >
                        <option value="">-- Select a class --</option>
                        {batchOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && selectedPackageSessionId && (
                <div className="flex items-center justify-center py-16">
                    <div className="flex items-center gap-3 text-gray-500">
                        <svg
                            className="animate-spin h-5 w-5 text-indigo-500"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        <span className="text-sm font-medium">Loading fee packages...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    Failed to load fee packages.{' '}
                    {error instanceof Error ? error.message : 'Please try again.'}
                </div>
            )}

            {/* Empty State - No class selected */}
            {!selectedPackageSessionId && (
                <div className="text-center py-16 text-gray-400">
                    <svg
                        className="w-12 h-12 mx-auto mb-3 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                    <p className="font-medium text-gray-500">
                        Select a class to view fee packages
                    </p>
                </div>
            )}

            {/* Empty State - No packages found */}
            {selectedPackageSessionId &&
                !isLoading &&
                !isError &&
                cpoPackages &&
                cpoPackages.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="font-medium text-gray-500">
                            No fee packages found for this class.
                        </p>
                    </div>
                )}

            {/* Package Stats */}
            {cpoPackages && cpoPackages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wide">
                            Total Packages
                        </div>
                        <div className="text-2xl font-extrabold text-indigo-700 mt-1">
                            {cpoPackages.length}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-wide">
                            Total Fee Types
                        </div>
                        <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                            {cpoPackages.reduce((sum, p) => sum + p.feeTypes.length, 0)}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                            Active Packages
                        </div>
                        <div className="text-2xl font-extrabold text-amber-700 mt-1">
                            {cpoPackages.filter((p) => p.status === 'ACTIVE').length}
                        </div>
                    </div>
                </div>
            )}

            {/* Package Cards */}
            {cpoPackages && cpoPackages.length > 0 && (
                <div className="flex flex-col gap-4">
                    {cpoPackages.map((pkg) => (
                        <PackageCard
                            key={pkg.id}
                            pkg={pkg}
                            isSelected={selectedPackageId === pkg.id}
                            onSelect={() =>
                                setSelectedPackageId(
                                    selectedPackageId === pkg.id ? null : pkg.id
                                )
                            }
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            {cpoPackages && cpoPackages.length > 0 && (
                <div className="text-xs text-gray-400 text-right">
                    Showing {cpoPackages.length} package
                    {cpoPackages.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* Create CPO Dialog */}
            {showCreateDialog && (
                <CreateCPODialog
                    batchOptions={batchOptions}
                    onSave={(data) => {
                        // TODO: Wire up POST API when backend endpoint is ready
                        console.log('CPO Package to save:', data);
                        setShowCreateDialog(false);
                    }}
                    onClose={() => setShowCreateDialog(false)}
                />
            )}
        </div>
    );
}
