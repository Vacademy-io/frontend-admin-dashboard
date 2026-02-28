import React, { useState } from 'react';
import { FeeType } from '../-types';
import { MOCK_CPOS, MOCK_FEE_TYPES, MOCK_AFVS } from '../-data/mockData';
import AssignedFeeValueDialog from './AssignedFeeValueDialog';

interface Props {
    initialCpoId?: string;
}

const statusBadge = (status: FeeType['status']) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            status === 'ACTIVE'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 bg-gray-100 text-gray-500'
        }`}
    >
        <span
            className={`h-1.5 w-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}
        />
        {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </span>
);

export default function FeeTypesTab({ initialCpoId }: Props) {
    const [selectedCpoId, setSelectedCpoId] = useState(initialCpoId ?? MOCK_CPOS[0]?.id ?? '');
    const [feeTypes, setFeeTypes] = useState<FeeType[]>(MOCK_FEE_TYPES);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FeeType | null>(null);
    const [afvTarget, setAfvTarget] = useState<{ id: string; name: string } | null>(null);
    const [form, setForm] = useState({
        name: '',
        code: '',
        description: '',
        status: 'ACTIVE' as FeeType['status'],
    });

    const visibleTypes = feeTypes.filter((f) => f.cpo_id === selectedCpoId);
    const selectedCpo = MOCK_CPOS.find((c) => c.id === selectedCpoId);

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', code: '', description: '', status: 'ACTIVE' });
        setModalOpen(true);
    };

    const openEdit = (ft: FeeType) => {
        setEditing(ft);
        setForm({
            name: ft.name,
            code: ft.code,
            description: ft.description ?? '',
            status: ft.status,
        });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.name.trim() || !form.code.trim()) return;
        if (editing) {
            setFeeTypes((prev) => prev.map((f) => (f.id === editing.id ? { ...f, ...form } : f)));
        } else {
            setFeeTypes((prev) => [
                ...prev,
                { id: `ft-${Date.now()}`, cpo_id: selectedCpoId, ...form },
            ]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id: string) => {
        setFeeTypes((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <div className="flex flex-col gap-6 duration-300 animate-in fade-in">
            {/* Toolbar */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                        Fee Package:
                    </span>
                    <select
                        value={selectedCpoId}
                        onChange={(e) => setSelectedCpoId(e.target.value)}
                        className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-600 focus:ring-blue-600"
                    >
                        {MOCK_CPOS.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Add Fee Type
                </button>
            </div>

            {/* Context label */}
            {selectedCpo && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                    Showing fee types under{' '}
                    <span className="ml-1 font-semibold text-gray-700">{selectedCpo.name}</span>
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse bg-white text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">
                                Fee Type
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">
                                Code
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">
                                Description
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {visibleTypes.map((ft) => (
                            <tr key={ft.id} className="transition-colors hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{ft.name}</td>
                                <td className="px-6 py-4">
                                    <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                                        {ft.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{ft.description || '—'}</td>
                                <td className="px-6 py-4">{statusBadge(ft.status)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        {(() => {
                                            const afv = MOCK_AFVS.find(
                                                (a) => a.fee_type_id === ft.id
                                            );
                                            return (
                                                <button
                                                    onClick={() =>
                                                        setAfvTarget({ id: ft.id, name: ft.name })
                                                    }
                                                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                                        afv
                                                            ? 'border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
                                                    }`}
                                                >
                                                    {afv
                                                        ? `₹ ${afv.amount.toLocaleString('en-IN')}`
                                                        : '₹ Set Fee Value'}
                                                </button>
                                            );
                                        })()}
                                        <button
                                            onClick={() => openEdit(ft)}
                                            className="font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ft.id)}
                                            className="font-medium text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {visibleTypes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-400">
                                    No fee types for this package. Click "Add Fee Type" to create
                                    one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assigned Fee Value Dialog */}
            {afvTarget && (
                <AssignedFeeValueDialog
                    feeTypeId={afvTarget.id}
                    feeTypeName={afvTarget.name}
                    onClose={() => setAfvTarget(null)}
                />
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm duration-200 animate-in fade-in">
                    <div className="mx-4 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b bg-gray-50/50 px-6 py-4">
                            <h3 className="text-base font-bold text-gray-800">
                                {editing ? 'Edit Fee Type' : 'Add Fee Type'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
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
                        <div className="space-y-4 p-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Fee Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, name: e.target.value }))
                                    }
                                    placeholder="E.g., Tuition Fee, Lab Fee"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            code: e.target.value.toUpperCase(),
                                        }))
                                    }
                                    placeholder="E.g., TF, LF, AF"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, description: e.target.value }))
                                    }
                                    placeholder="Optional description"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <div className="flex gap-4">
                                    {(['ACTIVE', 'INACTIVE'] as const).map((s) => (
                                        <label
                                            key={s}
                                            className="flex cursor-pointer items-center gap-2"
                                        >
                                            <input
                                                type="radio"
                                                name="ft-status"
                                                checked={form.status === s}
                                                onChange={() =>
                                                    setForm((f) => ({ ...f, status: s }))
                                                }
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {s === 'ACTIVE' ? 'Active' : 'Inactive'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                            >
                                {editing ? 'Save Changes' : 'Create Fee Type'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
