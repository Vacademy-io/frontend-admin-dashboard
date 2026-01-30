import { useState, useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { Helmet } from 'react-helmet';
import { MyButton } from '@/components/design-system/button';
import { InquiryFormPage } from './InquiryFormPage';
import { MagnifyingGlass, CaretRight, CaretDown } from '@phosphor-icons/react';

// Mock Data for Inquiries
const MOCK_INQUIRIES = [
    {
        id: 'INQ-2024-001',
        studentName: 'Aarav Patel',
        admissionClass: 'Class 5',
        parentName: 'Rajesh Patel',
        mobile: '9876543210',
        status: 'NEW',
        date: '2024-01-28',
    },
    {
        id: 'INQ-2024-002',
        studentName: 'Zara Khan',
        admissionClass: 'Class 8',
        parentName: 'Imran Khan',
        mobile: '9898989898',
        status: 'FOLLOW_UP',
        date: '2024-01-27',
    },
    {
        id: 'INQ-2024-003',
        studentName: 'Vihaan Singh',
        admissionClass: 'Class 1',
        parentName: 'Amit Singh',
        mobile: '9123456789',
        status: 'CONVERTED',
        date: '2024-01-25',
    },
];

export function InquiryPage() {
    const { setNavHeading } = useNavHeadingStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filter States
    const [filters, setFilters] = useState({
        academicYear: '2025-2026',
        enquiryStage: 'Open',
        admissionClass: 'All Classes',
        source: 'All Sources',
        dateRange: 'Today',
        dateOrder: 'Descending',
    });

    useEffect(() => {
        setNavHeading(
            <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-neutral-900">Enquiries</span>
                <button className="text-sm font-medium text-primary-500 hover:underline">
                    View Admission Process
                </button>
            </div>
        );
    }, [setNavHeading]);

    return (
        <div className="flex h-full flex-col space-y-6 p-6">
            <Helmet>
                <title>Inquiry - Admissions</title>
            </Helmet>

            {/* Header Action Buttons */}
            <div className="flex justify-end gap-3">
                <MyButton
                    buttonType="secondary"
                    className="!min-w-[120px]"
                    onClick={() => setShowCreateModal(true)}
                >
                    Create Enquiry
                </MyButton>
                <MyButton buttonType="secondary" className="!min-w-[120px]">
                    Upload Enquiry
                </MyButton>
            </div>

            {/* Filter Section Card */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {/* Academic Year */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                            Academic Year
                        </label>
                        <select
                            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={filters.academicYear}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, academicYear: e.target.value }))
                            }
                        >
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                        </select>
                    </div>

                    {/* Enquiry Stage */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                            Enquiry Stage
                        </label>
                        <div className="relative">
                            <select
                                className="h-10 w-full appearance-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={filters.enquiryStage}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        enquiryStage: e.target.value,
                                    }))
                                }
                            >
                                <option value="Open">Open</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Follow-up">Follow-up</option>
                                <option value="Closed">Closed</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                                <CaretDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Classes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                            Classes
                        </label>
                        <select
                            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={filters.admissionClass}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, admissionClass: e.target.value }))
                            }
                        >
                            <option value="All Classes">All Classes</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={`Class ${i + 1}`}>
                                    Class {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Source */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                            Source
                        </label>
                        <select
                            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={filters.source}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, source: e.target.value }))
                            }
                        >
                            <option value="All Sources">All Sources</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Website">Website</option>
                            <option value="Referral">Referral</option>
                            <option value="Advertisement">Advertisement</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                            Date Range
                        </label>
                        <select
                            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={filters.dateRange}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
                            }
                        >
                            <option value="Today">Today</option>
                            <option value="Yesterday">Yesterday</option>
                            <option value="This Week">This Week</option>
                            <option value="This Month">This Month</option>
                            <option value="Custom">Custom Range</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex items-end gap-6">
                    <div className="w-1/5 space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                            Date Order
                        </label>
                        <select
                            className="h-10 w-full rounded-md border-2 border-primary-500 bg-white px-3 py-2 text-sm text-neutral-700 ring-primary-500 focus:outline-none focus:ring-1"
                            value={filters.dateOrder}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, dateOrder: e.target.value }))
                            }
                        >
                            <option value="Descending">Descending</option>
                            <option value="Ascending">Ascending</option>
                        </select>
                    </div>
                    <MyButton buttonType="primary" className="h-10 !min-w-[80px] px-6">
                        Get
                    </MyButton>
                </div>
            </div>

            {/* List Header with Search */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search inquiries..."
                            className="h-10 w-64 rounded-md border border-neutral-300 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-neutral-600">
                    <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
                        <tr>
                            <th className="px-6 py-3">Inquiry ID</th>
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
                        {MOCK_INQUIRIES.map((row) => (
                            <tr key={row.id} className="hover:bg-neutral-50">
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-primary-600">
                                    {row.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-neutral-900">
                                    {row.studentName}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {row.admissionClass}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">{row.parentName}</td>
                                <td className="whitespace-nowrap px-6 py-4">{row.mobile}</td>
                                <td className="whitespace-nowrap px-6 py-4">{row.date}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                        ${
                                            row.status === 'NEW'
                                                ? 'bg-blue-100 text-blue-800'
                                                : row.status === 'CONVERTED'
                                                  ? 'bg-green-100 text-green-800'
                                                  : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
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
                <span>Showing 1 to 3 of 3 entries</span>
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
            {showCreateModal && <InquiryFormPage onClose={() => setShowCreateModal(false)} />}
        </div>
    );
}
