import { useState, useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { Helmet } from 'react-helmet';
import { MyButton } from '@/components/design-system/button';
import {
    CaretRight,
    MagnifyingGlass,
    Plus,
    FileText,
    CheckCircle,
    WarningCircle,
} from '@phosphor-icons/react';

// Mock Data for Documents
const MOCK_DOCUMENTS = [
    {
        id: 'DOC-2024-001',
        registrationId: 'REG-2024-1234',
        studentName: 'Aarav Patel',
        documentType: 'Passport Photo',
        uploadDate: '2024-01-28',
        status: 'VERIFIED',
    },
    {
        id: 'DOC-2024-002',
        registrationId: 'REG-2024-1234',
        studentName: 'Aarav Patel',
        documentType: 'Birth Certificate',
        uploadDate: '2024-01-28',
        status: 'PENDING',
    },
    {
        id: 'DOC-2024-003',
        registrationId: 'REG-2024-5678',
        studentName: 'Zara Khan',
        documentType: 'Aadhaar Card',
        uploadDate: '2024-01-27',
        status: 'REJECTED',
    },
];

export function DocumentsPage() {
    const { setNavHeading } = useNavHeadingStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setNavHeading(
            <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Admissions Documents</span>
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    {MOCK_DOCUMENTS.length}
                </span>
            </div>
        );
    }, [setNavHeading]);

    return (
        <div className="flex h-full flex-col p-6">
            <Helmet>
                <title>Documents - Admissions</title>
            </Helmet>

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="h-10 w-64 rounded-md border border-neutral-300 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select className="h-10 rounded-md border border-neutral-300 px-3 text-sm focus:border-primary-500 focus:outline-none">
                        <option value="">All Status</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                <MyButton buttonType="primary">
                    <Plus className="mr-2" />
                    Upload Document
                </MyButton>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-neutral-600">
                    <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                        <tr>
                            <th className="px-6 py-3">Doc ID</th>
                            <th className="px-6 py-3">Reg. ID</th>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Document Type</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {MOCK_DOCUMENTS.map((row) => (
                            <tr key={row.id} className="hover:bg-neutral-50">
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-primary-600">
                                    {row.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-neutral-900">
                                    {row.registrationId}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">{row.studentName}</td>
                                <td className="flex items-center gap-2 whitespace-nowrap px-6 py-4">
                                    <FileText size={18} className="text-neutral-400" />
                                    {row.documentType}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">{row.uploadDate}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium
                                        ${
                                            row.status === 'VERIFIED'
                                                ? 'bg-green-100 text-green-800'
                                                : row.status === 'PENDING'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {row.status === 'VERIFIED' && <CheckCircle size={14} />}
                                        {row.status === 'REJECTED' && <WarningCircle size={14} />}
                                        {row.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                    <button className="text-neutral-400 hover:text-primary-600">
                                        <CaretRight className="size-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                <span>
                    Showing 1 to {MOCK_DOCUMENTS.length} of {MOCK_DOCUMENTS.length} entries
                </span>
                <div className="flex gap-2">
                    <button
                        className="rounded border border-neutral-300 px-2 py-1 disabled:opacity-50"
                        disabled
                    >
                        Previous
                    </button>
                    <button
                        className="rounded border border-neutral-300 px-2 py-1 disabled:opacity-50"
                        disabled
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
