import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { Helmet } from 'react-helmet';
import {
    MagnifyingGlass,
    Funnel,
    ArrowsDownUp,
    CheckCircle,
    ClockCountdown,
    UserCheck,
    CurrencyCircleDollar,
    XCircle,
    Eye,
    PencilSimple,
    DotsThreeVertical,
    Users,
    ChartBar,
    CaretRight,
    Buildings,
} from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { MyButton } from '@/components/design-system/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Admission, AdmissionStatus, AdmissionStats } from '../-types/admission-types';

// Status configuration
const STATUS_CONFIG: Record<
    AdmissionStatus,
    { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
    PENDING_VERIFICATION: {
        label: 'Pending Verification',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50 border-amber-200',
        icon: <ClockCountdown size={14} />,
    },
    DOCUMENTS_VERIFIED: {
        label: 'Docs Verified',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: <CheckCircle size={14} />,
    },
    PENDING_ALLOCATION: {
        label: 'Pending Allocation',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: <Buildings size={14} />,
    },
    ALLOCATED: {
        label: 'Allocated',
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-50 border-indigo-200',
        icon: <UserCheck size={14} />,
    },
    PENDING_PAYMENT: {
        label: 'Pending Payment',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: <CurrencyCircleDollar size={14} />,
    },
    PAYMENT_COMPLETE: {
        label: 'Payment Complete',
        color: 'text-teal-700',
        bgColor: 'bg-teal-50 border-teal-200',
        icon: <CurrencyCircleDollar size={14} />,
    },
    ENROLLED: {
        label: 'Enrolled',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
        icon: <CheckCircle size={14} />,
    },
    REJECTED: {
        label: 'Rejected',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        icon: <XCircle size={14} />,
    },
};

// Mock data
const MOCK_ADMISSIONS: Admission[] = [
    {
        id: 'ADM-2026-0001',
        registrationId: 'REG-2026-0001',
        studentName: 'Aarav Sharma',
        dateOfBirth: '2012-05-15',
        gender: 'MALE',
        parentName: 'Rajesh Sharma',
        parentPhone: '+91 98765 43210',
        applyingForClass: 'Class 8',
        preferredBoard: 'CBSE',
        academicYear: '2026-27',
        status: 'PENDING_VERIFICATION',
        registrationDate: '2026-01-20',
        documentsVerified: false,
        seatConfirmed: false,
        totalFee: 85000,
        paidAmount: 5000,
        pendingAmount: 80000,
        paymentStatus: 'PARTIAL',
    },
    {
        id: 'ADM-2026-0002',
        registrationId: 'REG-2026-0002',
        studentName: 'Priya Patel',
        dateOfBirth: '2013-08-22',
        gender: 'FEMALE',
        parentName: 'Vikram Patel',
        parentPhone: '+91 87654 32109',
        applyingForClass: 'Class 7',
        preferredBoard: 'CBSE',
        academicYear: '2026-27',
        status: 'DOCUMENTS_VERIFIED',
        registrationDate: '2026-01-18',
        documentsVerified: true,
        verifiedBy: 'Admin',
        verifiedAt: '2026-01-22',
        seatConfirmed: false,
        totalFee: 82000,
        paidAmount: 5000,
        pendingAmount: 77000,
        paymentStatus: 'PARTIAL',
    },
    {
        id: 'ADM-2026-0003',
        registrationId: 'REG-2026-0003',
        studentName: 'Arjun Singh',
        dateOfBirth: '2011-03-10',
        gender: 'MALE',
        parentName: 'Manpreet Singh',
        parentPhone: '+91 76543 21098',
        applyingForClass: 'Class 9',
        preferredBoard: 'CBSE',
        academicYear: '2026-27',
        status: 'ALLOCATED',
        registrationDate: '2026-01-15',
        documentsVerified: true,
        allocatedSection: '9-A',
        allocatedRollNumber: '25',
        seatConfirmed: true,
        totalFee: 90000,
        paidAmount: 10000,
        pendingAmount: 80000,
        paymentStatus: 'PARTIAL',
    },
    {
        id: 'ADM-2026-0004',
        registrationId: 'REG-2026-0004',
        studentName: 'Ananya Reddy',
        dateOfBirth: '2014-11-28',
        gender: 'FEMALE',
        parentName: 'Suresh Reddy',
        parentPhone: '+91 65432 10987',
        applyingForClass: 'Class 6',
        preferredBoard: 'CBSE',
        academicYear: '2026-27',
        status: 'ENROLLED',
        registrationDate: '2026-01-10',
        admissionDate: '2026-01-24',
        documentsVerified: true,
        allocatedSection: '6-B',
        allocatedRollNumber: '18',
        seatConfirmed: true,
        totalFee: 78000,
        paidAmount: 78000,
        pendingAmount: 0,
        paymentStatus: 'COMPLETE',
        admissionNumber: 'SCH2026-0234',
        enrollmentDate: '2026-01-24',
    },
    {
        id: 'ADM-2026-0005',
        registrationId: 'REG-2026-0005',
        studentName: 'Rohan Gupta',
        dateOfBirth: '2010-07-05',
        gender: 'MALE',
        parentName: 'Amit Gupta',
        parentPhone: '+91 54321 09876',
        applyingForClass: 'Class 10',
        preferredBoard: 'CBSE',
        academicYear: '2026-27',
        status: 'PENDING_PAYMENT',
        registrationDate: '2026-01-12',
        documentsVerified: true,
        allocatedSection: '10-C',
        allocatedRollNumber: '32',
        seatConfirmed: true,
        totalFee: 95000,
        paidAmount: 0,
        pendingAmount: 95000,
        paymentStatus: 'PENDING',
    },
];

const MOCK_STATS: AdmissionStats = {
    totalPending: 12,
    documentsVerified: 8,
    allocated: 15,
    paymentComplete: 6,
    enrolled: 45,
    rejected: 2,
};

export function AdmissionPage() {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [admissions, setAdmissions] = useState<Admission[]>(MOCK_ADMISSIONS);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedClass, setSelectedClass] = useState<string>('All Classes');
    const [stats] = useState<AdmissionStats>(MOCK_STATS);

    useEffect(() => {
        setNavHeading(
            <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Admission Finalization</span>
            </div>
        );
    }, [setNavHeading]);

    // Filter admissions
    const filteredAdmissions = admissions.filter((adm) => {
        const matchesSearch =
            searchQuery === '' ||
            adm.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adm.parentPhone.includes(searchQuery);

        const matchesStatus = selectedStatus === 'all' || adm.status === selectedStatus;

        const matchesClass =
            selectedClass === 'All Classes' || adm.applyingForClass === selectedClass;

        return matchesSearch && matchesStatus && matchesClass;
    });

    const handleViewAdmission = (adm: Admission) => {
        navigate({ to: `/admissions/admission/${adm.id}` });
    };

    const getNextAction = (status: AdmissionStatus): string => {
        switch (status) {
            case 'PENDING_VERIFICATION':
                return 'Verify Documents';
            case 'DOCUMENTS_VERIFIED':
            case 'PENDING_ALLOCATION':
                return 'Allocate Section';
            case 'ALLOCATED':
            case 'PENDING_PAYMENT':
                return 'Collect Payment';
            case 'PAYMENT_COMPLETE':
                return 'Complete Enrollment';
            case 'ENROLLED':
                return 'View Details';
            default:
                return 'View Details';
        }
    };

    return (
        <>
            <Helmet>
                <title>Admission Finalization - Admissions</title>
                <meta name="description" content="Finalize student admissions" />
            </Helmet>

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600">
                                    Pending Verification
                                </p>
                                <p className="mt-1 text-2xl font-bold text-amber-800">
                                    {stats.totalPending}
                                </p>
                            </div>
                            <div className="rounded-full bg-amber-200 p-3">
                                <ClockCountdown size={24} className="text-amber-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Docs Verified</p>
                                <p className="mt-1 text-2xl font-bold text-blue-800">
                                    {stats.documentsVerified}
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-200 p-3">
                                <CheckCircle size={24} className="text-blue-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Allocated</p>
                                <p className="mt-1 text-2xl font-bold text-purple-800">
                                    {stats.allocated}
                                </p>
                            </div>
                            <div className="rounded-full bg-purple-200 p-3">
                                <Users size={24} className="text-purple-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-teal-600">Payment Done</p>
                                <p className="mt-1 text-2xl font-bold text-teal-800">
                                    {stats.paymentComplete}
                                </p>
                            </div>
                            <div className="rounded-full bg-teal-200 p-3">
                                <CurrencyCircleDollar size={24} className="text-teal-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Enrolled</p>
                                <p className="mt-1 text-2xl font-bold text-green-800">
                                    {stats.enrolled}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-200 p-3">
                                <UserCheck size={24} className="text-green-700" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1">
                            <MagnifyingGlass
                                size={20}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <Input
                                placeholder="Search by ID, Name, or Phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 max-w-md bg-neutral-50 pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <MyButton
                                buttonType="secondary"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Funnel size={18} />
                                Filters
                            </MyButton>
                            <MyButton buttonType="secondary">
                                <ChartBar size={18} />
                                Reports
                            </MyButton>
                        </div>
                    </div>

                    {/* Filter Row */}
                    {showFilters && (
                        <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-100 pt-4">
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="h-10 w-[180px] bg-neutral-50">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="h-10 w-[160px] bg-neutral-50">
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Classes">All Classes</SelectItem>
                                    {[
                                        'Class 1',
                                        'Class 2',
                                        'Class 3',
                                        'Class 4',
                                        'Class 5',
                                        'Class 6',
                                        'Class 7',
                                        'Class 8',
                                        'Class 9',
                                        'Class 10',
                                        'Class 11',
                                        'Class 12',
                                    ].map((cls) => (
                                        <SelectItem key={cls} value={cls}>
                                            {cls}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select defaultValue="2026-27">
                                <SelectTrigger className="h-10 w-[140px] bg-neutral-50">
                                    <SelectValue placeholder="Academic Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025-26">2025-26</SelectItem>
                                    <SelectItem value="2026-27">2026-27</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Admissions Table */}
                <div className="rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                        <p className="text-sm font-medium text-neutral-600">
                            Showing {filteredAdmissions.length} admissions
                        </p>
                        <MyButton buttonType="secondary" scale="small">
                            <ArrowsDownUp size={16} />
                            Sort
                        </MyButton>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[180px]">Admission ID</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Fee Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAdmissions.map((adm) => {
                                const statusConfig = STATUS_CONFIG[adm.status];
                                return (
                                    <TableRow
                                        key={adm.id}
                                        className="cursor-pointer"
                                        onClick={() => handleViewAdmission(adm)}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="font-mono text-sm font-medium text-primary-600">
                                                    {adm.id}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {format(
                                                        new Date(adm.registrationDate),
                                                        'dd MMM yyyy'
                                                    )}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-neutral-800">
                                                    {adm.studentName}
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    {adm.parentName}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="rounded bg-neutral-100 px-2 py-1 text-sm font-medium">
                                                {adm.applyingForClass}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {adm.allocatedSection ? (
                                                <span className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-700">
                                                    {adm.allocatedSection}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-neutral-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
                                                    statusConfig.bgColor,
                                                    statusConfig.color
                                                )}
                                            >
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    ₹{adm.paidAmount.toLocaleString()} /{' '}
                                                    <span className="text-neutral-500">
                                                        ₹{adm.totalFee.toLocaleString()}
                                                    </span>
                                                </p>
                                                <div className="mt-1 h-1.5 w-24 rounded-full bg-neutral-200">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            adm.paymentStatus === 'COMPLETE'
                                                                ? 'bg-green-500'
                                                                : adm.paymentStatus === 'PARTIAL'
                                                                  ? 'bg-amber-500'
                                                                  : 'bg-red-500'
                                                        )}
                                                        style={{
                                                            width: `${(adm.paidAmount / adm.totalFee) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div
                                                className="flex items-center justify-end gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="small"
                                                    className="h-8"
                                                >
                                                    {getNextAction(adm.status)}
                                                    <CaretRight size={14} />
                                                </MyButton>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="rounded p-1.5 hover:bg-neutral-100">
                                                            <DotsThreeVertical size={18} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye size={16} className="mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <PencilSimple
                                                                size={16}
                                                                className="mr-2"
                                                            />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {filteredAdmissions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="rounded-full bg-neutral-100 p-4">
                                <Users size={32} className="text-neutral-400" />
                            </div>
                            <p className="mt-4 text-lg font-medium text-neutral-600">
                                No admissions found
                            </p>
                            <p className="text-sm text-neutral-500">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
