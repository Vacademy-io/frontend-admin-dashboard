import React, { useState } from 'react';
import { ComplexPaymentOption } from '../-types';
import { MOCK_CPOS } from '../-data/mockData';

interface Props {
    onManageFeeTypes: (cpoId: string) => void;
}

const statusBadge = (status: ComplexPaymentOption['status']) => (
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

export default function ComplexPaymentOptionsTab({ onManageFeeTypes }: Props) {
    const [cpos, setCpos] = useState<ComplexPaymentOption[]>(MOCK_CPOS);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ComplexPaymentOption | null>(null);
    const [form, setForm] = useState({
        name: '',
        status: 'ACTIVE' as ComplexPaymentOption['status'],
    });

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', status: 'ACTIVE' });
        setModalOpen(true);
    };

    const openEdit = (cpo: ComplexPaymentOption) => {
        setEditing(cpo);
        setForm({ name: cpo.name, status: cpo.status });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.name.trim()) return;
        if (editing) {
            setCpos((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...form } : c)));
        } else {
            setCpos((prev) => [...prev, { id: `cpo-${Date.now()}`, ...form }]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id: string) => {
        setCpos((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div className="flex flex-col gap-6 duration-300 animate-in fade-in">
            {/* Toolbar */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div>
                    <p className="text-sm font-semibold text-gray-800">Fee Packages (CPOs)</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                        A Fee Package groups related fee types for a session or category.
                    </p>
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
                    Add Fee Package
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse bg-white text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-600">
                                Package Name
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
                        {cpos.map((cpo) => (
                            <tr key={cpo.id} className="transition-colors hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{cpo.name}</td>
                                <td className="px-6 py-4">{statusBadge(cpo.status)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => onManageFeeTypes(cpo.id)}
                                            className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            Manage Fee Types
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
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => openEdit(cpo)}
                                            className="font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cpo.id)}
                                            className="font-medium text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {cpos.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500">
                                    No fee packages yet. Click "Add Fee Package" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm duration-200 animate-in fade-in">
                    <div className="mx-4 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b bg-gray-50/50 px-6 py-4">
                            <h3 className="text-base font-bold text-gray-800">
                                {editing ? 'Edit Fee Package' : 'Add Fee Package'}
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
                                    Package Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, name: e.target.value }))
                                    }
                                    placeholder="E.g., Standard 2025-26, Hostel Package"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                                                name="cpo-status"
                                                checked={form.status === s}
                                                onChange={() =>
                                                    setForm((f) => ({ ...f, status: s }))
                                                }
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-600"
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
                                {editing ? 'Save Changes' : 'Create Package'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
