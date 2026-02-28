import React, { useState } from 'react';
import { AssignedFeeValue } from '../-types';
import { MOCK_AFVS, MOCK_INSTALLMENTS } from '../-data/mockData';

interface Props {
    feeTypeId: string;
    feeTypeName: string;
    onClose: () => void;
}

type InstallmentRow = {
    tempId: string;
    installment_number: number;
    amount: number;
    due_date: string; // 'YYYY-MM-DD'
};

// ─── Preset plan definitions ──────────────────────────────────────────────────

interface PresetPlan {
    id: string;
    label: string;
    description: string;
    count: number; // 0 = custom
    intervalMonths: number; // months between installments (0 = custom)
}

const PRESET_PLANS: PresetPlan[] = [
    {
        id: 'quarterly',
        label: 'Quarterly',
        description: '4 payments, every 3 months',
        count: 4,
        intervalMonths: 3,
    },
    {
        id: 'term-wise',
        label: 'Term-wise',
        description: '3 payments, every 4 months',
        count: 3,
        intervalMonths: 4,
    },
    {
        id: 'monthly',
        label: 'Monthly',
        description: '12 equal monthly payments',
        count: 12,
        intervalMonths: 1,
    },
    {
        id: 'custom',
        label: 'Custom',
        description: 'Define your own schedule',
        count: 0,
        intervalMonths: 0,
    },
];

/** Returns 'YYYY-MM-01' for N months from now */
function firstOfMonth(addMonths: number): string {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + addMonths, 1);
    return d.toISOString().slice(0, 10);
}

function generateRows(plan: PresetPlan, totalAmount: number): InstallmentRow[] {
    if (plan.id === 'custom' || plan.count === 0) return [];
    const base = Math.floor((totalAmount / plan.count) * 100) / 100;
    const remainder = Math.round((totalAmount - base * plan.count) * 100) / 100;
    return Array.from({ length: plan.count }, (_, i) => ({
        tempId: `preset-${Date.now()}-${i}`,
        installment_number: i + 1,
        amount: i === plan.count - 1 ? base + remainder : base, // add rounding to last
        due_date: firstOfMonth(i * plan.intervalMonths),
    }));
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

const Toggle = ({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}) => (
    <label className="flex cursor-pointer items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                checked ? 'bg-blue-600' : 'bg-gray-200'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssignedFeeValueDialog({ feeTypeId, feeTypeName, onClose }: Props) {
    const existingAfv = MOCK_AFVS.find((a) => a.fee_type_id === feeTypeId);

    const [form, setForm] = useState<Omit<AssignedFeeValue, 'id' | 'fee_type_id'>>({
        amount: existingAfv?.amount ?? 0,
        has_installment: existingAfv?.has_installment ?? false,
        is_refundable: existingAfv?.is_refundable ?? false,
        has_penalty: existingAfv?.has_penalty ?? false,
        penalty_percentage: existingAfv?.penalty_percentage,
        status: existingAfv?.status ?? 'ACTIVE',
    });

    const [selectedPlanId, setSelectedPlanId] = useState<string>('quarterly');

    // Single due date used only for the one-time (non-installment) path
    const [oneTimeDueDate, setOneTimeDueDate] = useState<string>(firstOfMonth(0));

    const [installments, setInstallments] = useState<InstallmentRow[]>(() => {
        if (!existingAfv) return [];
        return MOCK_INSTALLMENTS.filter((i) => i.assigned_fee_value_id === existingAfv.id).map(
            (i) => ({
                tempId: i.id,
                installment_number: i.installment_number,
                amount: i.amount,
                due_date: i.due_date,
            })
        );
    });

    // Apply a preset plan (regenerates rows)
    const applyPreset = (plan: PresetPlan) => {
        setSelectedPlanId(plan.id);
        if (plan.id !== 'custom') {
            setInstallments(generateRows(plan, form.amount));
        }
    };

    const addInstallment = () => {
        const nextNum =
            installments.length > 0
                ? Math.max(...installments.map((i) => i.installment_number)) + 1
                : 1;
        setInstallments((prev) => [
            ...prev,
            {
                tempId: `new-${Date.now()}`,
                installment_number: nextNum,
                amount: 0,
                due_date: firstOfMonth(nextNum - 1),
            },
        ]);
    };

    const updateInstallment = (tempId: string, field: string, value: string | number) => {
        setInstallments((prev) =>
            prev.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i))
        );
    };

    const removeInstallment = (tempId: string) => {
        setInstallments((prev) => prev.filter((i) => i.tempId !== tempId));
    };

    const totalInstallmentAmount = installments.reduce((sum, i) => sum + Number(i.amount), 0);
    const amountMatch = Math.abs(totalInstallmentAmount - form.amount) < 0.01;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm duration-200 animate-in fade-in">
            <div className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-gray-50/50 px-6 py-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-800">
                            Fee Value — {feeTypeName}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Set the financial contract for this fee type
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Amount */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Total Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center overflow-hidden rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                            <span className="border-r border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500">
                                ₹
                            </span>
                            <input
                                type="number"
                                min={0}
                                value={form.amount}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                                }
                                className="flex-1 px-3 py-2 text-sm outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 px-4">
                        <Toggle
                            checked={form.is_refundable}
                            onChange={(v) => setForm((f) => ({ ...f, is_refundable: v }))}
                            label="Is Refundable"
                        />
                        <Toggle
                            checked={form.has_penalty}
                            onChange={(v) =>
                                setForm((f) => ({
                                    ...f,
                                    has_penalty: v,
                                    penalty_percentage: v ? f.penalty_percentage : undefined,
                                }))
                            }
                            label="Has Late Penalty"
                        />
                        {form.has_penalty && (
                            <div className="py-3">
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Penalty Percentage (%)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={form.penalty_percentage ?? ''}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            penalty_percentage: Number(e.target.value),
                                        }))
                                    }
                                    className="w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="E.g. 5"
                                />
                            </div>
                        )}
                        <Toggle
                            checked={form.has_installment}
                            onChange={(v) => {
                                setForm((f) => ({ ...f, has_installment: v }));
                                if (!v) {
                                    setInstallments([]);
                                    setSelectedPlanId('quarterly');
                                }
                            }}
                            label="Split into Installments"
                        />
                    </div>

                    {/* ── One-time due date (no installments) ── */}
                    {!form.has_installment && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={oneTimeDueDate}
                                onChange={(e) => setOneTimeDueDate(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-[11px] text-gray-400">
                                Full amount is due in a single payment on this date.
                            </p>
                        </div>
                    )}

                    {/* ── Installment section ── */}
                    {form.has_installment && (
                        <div className="space-y-4">
                            {/* Plan picker */}
                            <div>
                                <p className="mb-2 text-sm font-semibold text-gray-700">
                                    Choose a plan
                                </p>
                                <div className="grid grid-cols-5 gap-2">
                                    {PRESET_PLANS.map((plan) => {
                                        const active = selectedPlanId === plan.id;
                                        return (
                                            <button
                                                key={plan.id}
                                                onClick={() => applyPreset(plan)}
                                                className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 px-2 py-3 text-center transition-all ${
                                                    active
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/40'
                                                }`}
                                            >
                                                <span className="text-xs font-bold leading-tight">
                                                    {plan.label}
                                                </span>
                                                <span className="text-[10px] leading-tight text-gray-400">
                                                    {plan.description}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedPlanId !== 'custom' && (
                                    <p className="mt-1.5 text-[11px] text-gray-400">
                                        Amounts are split equally. Due dates default to the 1st of
                                        each month — you can edit any row below.
                                    </p>
                                )}
                            </div>

                            {/* Installment table */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-800">
                                        Installment Schedule
                                    </h4>
                                    {/* Always allow adding rows manually */}
                                    <button
                                        onClick={addInstallment}
                                        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        Add Row
                                    </button>
                                </div>

                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="w-10 px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-600">
                                                    #
                                                </th>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-600">
                                                    Amount (₹)
                                                </th>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-gray-600">
                                                    Due Date
                                                </th>
                                                <th className="w-8 px-4 py-2.5" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {installments.map((inst) => (
                                                <tr
                                                    key={inst.tempId}
                                                    className="bg-white hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-2 font-medium text-gray-500">
                                                        {inst.installment_number}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={inst.amount}
                                                            onChange={(e) =>
                                                                updateInstallment(
                                                                    inst.tempId,
                                                                    'amount',
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                            className="w-28 rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="date"
                                                            value={inst.due_date}
                                                            onChange={(e) =>
                                                                updateInstallment(
                                                                    inst.tempId,
                                                                    'due_date',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            onClick={() =>
                                                                removeInstallment(inst.tempId)
                                                            }
                                                            className="text-gray-400 transition-colors hover:text-red-500"
                                                        >
                                                            <svg
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {installments.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="py-5 text-center text-xs text-gray-400"
                                                    >
                                                        {selectedPlanId === 'custom'
                                                            ? 'Click "Add Row" to build a custom schedule.'
                                                            : 'Select a plan above or enter a total amount first.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Amount match banner */}
                                {installments.length > 0 && (
                                    <div
                                        className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                                            amountMatch
                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                : 'border-amber-200 bg-amber-50 text-amber-700'
                                        }`}
                                    >
                                        <span>
                                            Installment Total:{' '}
                                            <strong>
                                                ₹{totalInstallmentAmount.toLocaleString()}
                                            </strong>
                                        </span>
                                        <span>
                                            {amountMatch
                                                ? '✓ Matches total amount'
                                                : `⚠ Difference: ₹${Math.abs(form.amount - totalInstallmentAmount).toLocaleString()}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        Save Fee Value
                    </button>
                </div>
            </div>
        </div>
    );
}
