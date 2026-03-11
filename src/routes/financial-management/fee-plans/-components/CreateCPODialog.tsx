// @ts-nocheck
import React, { useState } from 'react';

// ─── Types for the form ─────────────────────────────────────────────────────────

interface InstallmentForm {
    id: number;
    amount: number | string;
    dueDate: string;
}

interface FeeTypeForm {
    id: number;
    name: string;
    code: string;
    description: string;
    amount: number | string;
    hasInstallment: boolean;
    isRefundable: boolean;
    hasPenalty: boolean;
    penaltyPercentage: number | string;
    noOfInstallments: number | string;
    installments: InstallmentForm[];
}

interface CPOForm {
    name: string;
    status: string;
    packageSessionId: string;
    feeTypes: FeeTypeForm[];
}

export interface BatchOption {
    id: string;
    label: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const INSTALLMENT_PRESETS = [
    { label: 'Annual', count: 1 },
    { label: 'Half-Yearly', count: 2 },
    { label: 'Quarterly', count: 4 },
    { label: 'Monthly', count: 12 },
    { label: 'Custom', count: null },
];

const MONTHS = [
    'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December', 'January', 'February', 'March',
];

function generateInstallments(count: number, totalAmount: number): InstallmentForm[] {
    const perInstallment = totalAmount ? Math.floor(totalAmount / count) : 0;
    const remainder = totalAmount ? totalAmount - perInstallment * count : 0;
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        amount: i === 0 ? perInstallment + remainder : perInstallment,
        dueDate: '',
    }));
}

function createEmptyFeeType(id: number): FeeTypeForm {
    return {
        id,
        name: '',
        code: '',
        description: '',
        amount: '',
        hasInstallment: true,
        isRefundable: false,
        hasPenalty: false,
        penaltyPercentage: '',
        noOfInstallments: 4,
        installments: generateInstallments(4, 0),
    };
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div
            onClick={() => onChange(!value)}
            className="relative cursor-pointer flex-shrink-0"
            style={{ width: 38, height: 20 }}
        >
            <div
                className="rounded-full transition-colors"
                style={{
                    width: 38,
                    height: 20,
                    background: value ? '#6366f1' : '#d1d5db',
                }}
            />
            <div
                className="absolute top-0.5 rounded-full bg-white shadow transition-all"
                style={{
                    width: 16,
                    height: 16,
                    left: value ? 20 : 2,
                }}
            />
        </div>
    );
}

// ─── Fee Type Editor ────────────────────────────────────────────────────────────

function FeeTypeEditor({
    feeType,
    index,
    onChange,
    onRemove,
    canRemove,
}: {
    feeType: FeeTypeForm;
    index: number;
    onChange: (updated: FeeTypeForm) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const update = (field: string, value: any) => {
        onChange({ ...feeType, [field]: value });
    };

    const handlePreset = (count: number | null) => {
        if (count) {
            const total = parseFloat(feeType.amount as string) || 0;
            onChange({
                ...feeType,
                noOfInstallments: count,
                installments: generateInstallments(count, total),
            });
        }
    };

    const handleInstallmentCountChange = (val: string) => {
        const n = parseInt(val);
        if (n > 0 && n <= 60) {
            const total = parseFloat(feeType.amount as string) || 0;
            onChange({
                ...feeType,
                noOfInstallments: n,
                installments: generateInstallments(n, total),
            });
        } else {
            update('noOfInstallments', val);
        }
    };

    const handleAmountChange = (val: string) => {
        const total = parseFloat(val) || 0;
        const count = feeType.installments.length || 1;
        onChange({
            ...feeType,
            amount: val,
            installments: generateInstallments(count, total),
        });
    };

    const updateInstallment = (id: number, field: string, value: any) => {
        onChange({
            ...feeType,
            installments: feeType.installments.map((inst) =>
                inst.id === id ? { ...inst, [field]: value } : inst
            ),
        });
    };

    const installmentTotal = feeType.installments.reduce(
        (sum, i) => sum + (parseFloat(i.amount as string) || 0),
        0
    );
    const totalAmount = parseFloat(feeType.amount as string) || 0;
    const diff = totalAmount - installmentTotal;

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Fee Type Header */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-gray-900">
                            {feeType.name || `Fee Type ${index + 1}`}
                        </div>
                        {feeType.amount && (
                            <div className="text-xs text-gray-500">
                                ₹{parseFloat(feeType.amount as string).toLocaleString('en-IN')} ·{' '}
                                {feeType.installments.length} installment
                                {feeType.installments.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canRemove && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
                        >
                            Remove
                        </button>
                    )}
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Fee Type Form */}
            {isExpanded && (
                <div className="p-4 flex flex-col gap-4">
                    {/* Name & Description */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Fee Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                placeholder="e.g. Tuition Fee"
                                value={feeType.name}
                                onChange={(e) => update('name', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Description
                            </label>
                            <input
                                placeholder="Brief description"
                                value={feeType.description}
                                onChange={(e) => update('description', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Total Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 50000"
                            value={feeType.amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition font-semibold"
                        />
                    </div>

                    {/* Toggles Row */}
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Toggle value={feeType.hasInstallment} onChange={(v) => update('hasInstallment', v)} />
                            <span className="text-sm text-gray-700 font-medium">Has Installments</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Toggle value={feeType.isRefundable} onChange={(v) => update('isRefundable', v)} />
                            <span className="text-sm text-gray-700 font-medium">Refundable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Toggle value={feeType.hasPenalty} onChange={(v) => update('hasPenalty', v)} />
                            <span className="text-sm text-gray-700 font-medium">Late Penalty</span>
                        </div>
                        {feeType.hasPenalty && (
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    placeholder="%"
                                    value={feeType.penaltyPercentage}
                                    onChange={(e) => update('penaltyPercentage', e.target.value)}
                                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-indigo-500 transition"
                                />
                                <span className="text-xs text-gray-500">%</span>
                            </div>
                        )}
                    </div>

                    {/* Installment Configuration */}
                    {feeType.hasInstallment && (
                        <div className="flex flex-col gap-3">
                            {/* Frequency Presets */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Payment Frequency
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {INSTALLMENT_PRESETS.map((preset) => {
                                        const isActive =
                                            preset.count !== null &&
                                            Number(feeType.noOfInstallments) === preset.count;
                                        return (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => handlePreset(preset.count)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                                    isActive
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                {preset.label}
                                                {preset.count && (
                                                    <span className="ml-1 opacity-60">({preset.count}x)</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Custom count input */}
                                {![1, 2, 4, 12].includes(Number(feeType.noOfInstallments)) && (
                                    <input
                                        type="number"
                                        min={1}
                                        max={60}
                                        placeholder="Number of installments"
                                        value={feeType.noOfInstallments}
                                        onChange={(e) => handleInstallmentCountChange(e.target.value)}
                                        className="mt-2 w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition"
                                    />
                                )}
                            </div>

                            {/* Installment Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {diff !== 0 && totalAmount > 0 && (
                                    <div
                                        className={`px-3 py-2 text-xs font-medium ${
                                            diff > 0
                                                ? 'bg-amber-50 text-amber-700 border-b border-amber-100'
                                                : 'bg-red-50 text-red-700 border-b border-red-100'
                                        }`}
                                    >
                                        {diff > 0
                                            ? `₹${diff.toLocaleString('en-IN')} remaining to allocate`
                                            : `Exceeds total by ₹${Math.abs(diff).toLocaleString('en-IN')}`}
                                    </div>
                                )}
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">
                                                #
                                            </th>
                                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">
                                                Amount (₹)
                                            </th>
                                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">
                                                Due Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feeType.installments.map((inst, idx) => (
                                            <tr key={inst.id} className="border-b border-gray-50">
                                                <td className="py-2 px-3 text-gray-400 font-medium w-10">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number"
                                                        value={inst.amount}
                                                        onChange={(e) =>
                                                            updateInstallment(inst.id, 'amount', e.target.value)
                                                        }
                                                        className="w-28 border border-gray-200 rounded-md px-2 py-1 text-sm outline-none focus:border-indigo-500"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="date"
                                                        value={inst.dueDate}
                                                        onChange={(e) =>
                                                            updateInstallment(inst.id, 'dueDate', e.target.value)
                                                        }
                                                        className="border border-gray-200 rounded-md px-2 py-1 text-sm outline-none focus:border-indigo-500"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-50">
                                            <td className="py-2 px-3 font-bold text-gray-700">Total</td>
                                            <td
                                                className={`py-2 px-3 font-bold ${
                                                    installmentTotal === totalAmount
                                                        ? 'text-green-600'
                                                        : 'text-gray-800'
                                                }`}
                                            >
                                                ₹{installmentTotal.toLocaleString('en-IN')}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Dialog ────────────────────────────────────────────────────────────────

export default function CreateCPODialog({
    onSave,
    onClose,
    batchOptions,
}: {
    onSave: (data: CPOForm) => void;
    onClose: () => void;
    batchOptions: BatchOption[];
}) {
    const [form, setForm] = useState<CPOForm>({
        name: '',
        status: 'ACTIVE',
        packageSessionId: '',
        feeTypes: [createEmptyFeeType(1)],
    });

    const addFeeType = () => {
        const nextId = Math.max(...form.feeTypes.map((f) => f.id), 0) + 1;
        setForm((prev) => ({
            ...prev,
            feeTypes: [...prev.feeTypes, createEmptyFeeType(nextId)],
        }));
    };

    const removeFeeType = (id: number) => {
        setForm((prev) => ({
            ...prev,
            feeTypes: prev.feeTypes.filter((f) => f.id !== id),
        }));
    };

    const updateFeeType = (id: number, updated: FeeTypeForm) => {
        setForm((prev) => ({
            ...prev,
            feeTypes: prev.feeTypes.map((f) => (f.id === id ? updated : f)),
        }));
    };

    const isValid =
        form.packageSessionId !== '' &&
        form.name.trim() !== '' &&
        form.feeTypes.length > 0 &&
        form.feeTypes.every(
            (ft) =>
                ft.name.trim() !== '' &&
                parseFloat(ft.amount as string) > 0
        );

    const totalPackageAmount = form.feeTypes.reduce(
        (sum, ft) => sum + (parseFloat(ft.amount as string) || 0),
        0
    );

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[1000]"
            style={{
                background: 'rgba(15,23,42,0.55)',
                backdropFilter: 'blur(4px)',
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            <div className="bg-white rounded-2xl w-[min(860px,96vw)] max-h-[92vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">
                                Create Package
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                New Fee Package (CPO)
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer text-gray-500"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-5">
                    {/* Class / Batch Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Select Class / Batch <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.packageSessionId}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, packageSessionId: e.target.value }))
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition cursor-pointer bg-white"
                        >
                            <option value="">-- Select a class --</option>
                            {batchOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Package Name & Status */}
                    <div className="grid grid-cols-[1fr_200px] gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Package Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                placeholder="e.g. 2026 Elite Fee Plan"
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition cursor-pointer bg-white"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="DRAFT">Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary Bar */}
                    {form.feeTypes.length > 0 && (
                        <div className="flex items-center gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl px-4 py-3">
                            <div>
                                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                    Fee Types
                                </div>
                                <div className="text-lg font-extrabold text-indigo-800">
                                    {form.feeTypes.length}
                                </div>
                            </div>
                            <div className="w-px h-8 bg-indigo-200" />
                            <div>
                                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                    Total Amount
                                </div>
                                <div className="text-lg font-extrabold text-indigo-800">
                                    ₹{totalPackageAmount.toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="w-px h-8 bg-indigo-200" />
                            <div>
                                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                    Total Installments
                                </div>
                                <div className="text-lg font-extrabold text-indigo-800">
                                    {form.feeTypes.reduce(
                                        (sum, ft) => sum + (ft.hasInstallment ? ft.installments.length : 1),
                                        0
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fee Types Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-gray-800">
                                Fee Types
                            </label>
                            <button
                                type="button"
                                onClick={addFeeType}
                                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Fee Type
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {form.feeTypes.map((ft, idx) => (
                                <FeeTypeEditor
                                    key={ft.id}
                                    feeType={ft}
                                    index={idx}
                                    onChange={(updated) => updateFeeType(ft.id, updated)}
                                    onRemove={() => removeFeeType(ft.id)}
                                    canRemove={form.feeTypes.length > 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        disabled={!isValid}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition cursor-pointer ${
                            isValid
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-md'
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        Save Package
                    </button>
                </div>
            </div>
        </div>
    );
}
