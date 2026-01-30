import { useState, useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { Helmet } from 'react-helmet';
import { MyButton } from '@/components/design-system/button';
import { useNavigate } from '@tanstack/react-router';
import { MagnifyingGlass, Plus, CaretRight } from '@phosphor-icons/react';

// Mock Data for Registrations
const MOCK_REGISTRATIONS = [
    {
        id: 'REG-2024-001',
        studentName: 'Aarav Patel',
        class: 'Class 5',
        parentName: 'Rajesh Patel',
        mobile: '9876543210',
        status: 'SUBMITTED',
        date: '2024-01-28',
    },
    {
        id: 'REG-2024-002',
        studentName: 'Zara Khan',
        class: 'Class 8',
        parentName: 'Imran Khan',
        mobile: '9898989898',
        status: 'DOCUMENT_VERIFICATION',
        date: '2024-01-27',
    },
    {
        id: 'REG-2024-003',
        studentName: 'Vihaan Singh',
        class: 'Class 1',
        parentName: 'Amit Singh',
        mobile: '9123456789',
        status: 'ADMITTED',
        date: '2024-01-25',
    },
    {
        id: 'REG-2024-004',
        studentName: 'Priya Sharma',
        class: 'Kindergarten',
        parentName: 'Rohit Sharma',
        mobile: '9112233445',
        status: 'DRAFT',
        date: '2024-01-30',
    },
];

export function RegistrationListPage() {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const filteredRegistrations = MOCK_REGISTRATIONS.filter((reg) => {
        const matchesSearch =
            reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedStatus ? reg.status === selectedStatus : true;

        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        setNavHeading(
            <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Registration Management</span>
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    {filteredRegistrations.length}
                </span>
            </div>
        );
    }, [setNavHeading, filteredRegistrations.length]);

    const handleNewRegistration = () => {
        navigate({ to: '/admissions/registration/new' });
    };

    return (
        <div className="flex h-full flex-col p-6">
            <Helmet>
                <title>Registrations - Admissions</title>
            </Helmet>

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search registrations..."
                            className="h-10 w-64 rounded-md border border-neutral-300 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-10 rounded-md border border-neutral-300 px-3 text-sm focus:border-primary-500 focus:outline-none"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="DOCUMENT_VERIFICATION">Doc Verification</option>
                        <option value="ADMITTED">Admitted</option>
                    </select>
                </div>

                <MyButton buttonType="primary" onClick={handleNewRegistration}>
                    <Plus className="mr-2 size-4" />
                    New Registration
                </MyButton>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-neutral-600">
                    <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                        <tr>
                            <th className="px-6 py-3">Reg. ID</th>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Class</th>
                            <th className="px-6 py-3">Parent Name</th>
                            <th className="px-6 py-3">Mobile</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {filteredRegistrations.map((row) => (
                            <tr key={row.id} className="hover:bg-neutral-50">
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-primary-600">
                                    {row.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-neutral-900">
                                    {row.studentName}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">{row.class}</td>
                                <td className="whitespace-nowrap px-6 py-4">{row.parentName}</td>
                                <td className="whitespace-nowrap px-6 py-4">{row.mobile}</td>
                                <td className="whitespace-nowrap px-6 py-4">{row.date}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                        ${
                                            row.status === 'SUBMITTED'
                                                ? 'bg-blue-100 text-blue-800'
                                                : row.status === 'ADMITTED'
                                                  ? 'bg-green-100 text-green-800'
                                                  : row.status === 'DOCUMENT_VERIFICATION'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-neutral-100 text-neutral-800'
                                        }`}
                                    >
                                        {row.status.replace('_', ' ')}
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
                <span>Showing 1 to 4 of 4 entries</span>
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
