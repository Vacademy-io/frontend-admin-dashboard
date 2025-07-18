/* eslint-disable tailwindcss/no-custom-classname */
import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Helmet } from 'react-helmet';
import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { MyButton } from '@/components/design-system/button';
import {
    Eye,
    ArrowSquareOut,
    X,
    Phone,
    Clock,
    Key,
    Copy,
    GraduationCap,
    Shield,
    MapPin,
    Users,
} from 'phosphor-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, subMonths, subYears, startOfDay } from 'date-fns';
import { MyPagination } from '@/components/design-system/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { MyDropdown } from '@/components/design-system/dropdown';
import { CaretUpDown, CaretDown, CaretUp } from '@phosphor-icons/react';
import { Checkbox } from '@/components/ui/checkbox';

export const Route = createFileRoute('/study-library/attendance-tracker/')({
    component: RouteComponent,
});

// Mock class attendance data
interface ClassAttendanceItem {
    id: number;
    className: string;
    date: string;
    time: string;
    status: 'Present' | 'Absent';
}

type ClassAttendanceData = {
    [key: string]: ClassAttendanceItem[];
};

// Student interface for the attendance tracker
interface AttendanceStudent {
    id: string;
    name: string;
    username: string;
    batch: string;
    mobileNumber: string;
    email: string;
    attendedClasses: number;
    totalClasses: number;
    attendancePercentage: number;
}

// Create context for selected student
interface StudentSidebarContextType {
    selectedStudent: AttendanceStudent | null;
    setSelectedStudent: (student: AttendanceStudent | null) => void;
}

const StudentSidebarContext = createContext<StudentSidebarContextType | undefined>(undefined);

export const useStudentSidebar = () => {
    const context = useContext(StudentSidebarContext);
    if (!context) {
        throw new Error('useStudentSidebar must be used within a StudentSidebarProvider');
    }
    return context;
};

// Student Sidebar Component

// Student Sidebar Component
const StudentDetailsSidebar = () => {
    const { state } = useSidebar();
    const { toggleSidebar } = useSidebar();
    const { selectedStudent } = useStudentSidebar();
    const [category, setCategory] = useState('overview');

    useEffect(() => {
        if (state === 'expanded') {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('sidebar-open');
        };
    }, [state]);

    if (!selectedStudent) return null;

    // Calculate days until expiry (placeholder)
    const daysUntilExpiry = 118;

    return (
        <Sidebar side="right">
            <SidebarContent
                className={`sidebar-content flex flex-col border-l border-neutral-200 bg-white text-neutral-700`}
            >
                <SidebarHeader className="sticky top-0 z-10 border-b border-neutral-100 bg-white/95 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col p-4">
                        {/* Header with close button - enhanced with gradient */}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-1 animate-pulse rounded-full bg-gradient-to-b from-primary-500 to-primary-400"></div>
                                <h2 className="bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-lg font-semibold text-transparent">
                                    Student Profile
                                </h2>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="group rounded-xl p-2 transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 active:scale-95"
                            >
                                <X className="size-5 text-neutral-500 transition-colors duration-200 group-hover:text-red-500" />
                            </button>
                        </div>

                        {/* Enhanced tab navigation with modern design */}
                        <div className="relative flex gap-1 rounded-xl bg-gradient-to-r from-neutral-50 to-neutral-100 p-1.5 shadow-inner">
                            {/* Animated background indicator */}
                            <div
                                className={`absolute inset-y-1.5 rounded-lg bg-white shadow-lg transition-all duration-300 ease-out ${
                                    category === 'overview'
                                        ? 'left-1.5 w-[calc(33.333%-0.5rem)]'
                                        : category === 'learningProgress'
                                          ? 'left-[calc(33.333%+0.167rem)] w-[calc(33.333%-0.333rem)]'
                                          : 'left-[calc(66.666%+0.833rem)] w-[calc(33.333%-0.5rem)]'
                                }`}
                            ></div>

                            <button
                                className={`group relative z-10 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                                    category === 'overview'
                                        ? 'scale-105 text-primary-500'
                                        : 'text-neutral-600 hover:scale-100 hover:text-neutral-800'
                                }`}
                                onClick={() => setCategory('overview')}
                            >
                                <span className="relative">
                                    Overview
                                    {category === 'overview' && (
                                        <div className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 animate-bounce rounded-full bg-primary-500"></div>
                                    )}
                                </span>
                            </button>

                            <button
                                className={`group relative z-10 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                                    category === 'learningProgress'
                                        ? 'scale-105 text-primary-500'
                                        : 'text-neutral-600 hover:scale-100 hover:text-neutral-800'
                                }`}
                                onClick={() => setCategory('learningProgress')}
                            >
                                <span className="relative">
                                    Progress
                                    {category === 'learningProgress' && (
                                        <div className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 animate-bounce rounded-full bg-primary-500"></div>
                                    )}
                                </span>
                            </button>
                            <button
                                className={`group relative z-10 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                                    category === 'testRecord'
                                        ? 'scale-105 text-primary-500'
                                        : 'text-neutral-600 hover:scale-100 hover:text-neutral-800'
                                }`}
                                onClick={() => setCategory('testRecord')}
                            >
                                <span className="relative">
                                    Tests
                                    {category === 'testRecord' && (
                                        <div className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 animate-bounce rounded-full bg-primary-500"></div>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </SidebarHeader>

                <div className="flex-1 overflow-y-auto p-4">
                    {/* Enhanced student profile header with animations */}
                    <div className="relative mb-4 overflow-hidden rounded-xl border border-neutral-100 bg-gradient-to-r from-neutral-50/50 to-primary-50/30 p-4">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute right-0 top-0 size-32 -translate-y-16 translate-x-16 animate-pulse rounded-full bg-primary-500"></div>
                            <div className="absolute bottom-0 left-0 size-24 -translate-x-12 translate-y-12 animate-pulse rounded-full bg-primary-300 delay-1000"></div>
                        </div>

                        <div className="group relative flex items-center gap-4">
                            <div className="relative">
                                {/* Enhanced profile image with ring animation */}
                                <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 transition-transform duration-300 group-hover:scale-105">
                                    {/* Animated ring */}
                                    <div className="absolute inset-0 rounded-full ring-2 ring-primary-500/20 ring-offset-2 ring-offset-white transition-all duration-300 group-hover:ring-primary-500/40"></div>
                                    <div className="text-primary-600 flex size-full items-center justify-center bg-neutral-100 text-2xl font-bold">
                                        {selectedStudent.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                    </div>
                                </div>

                                {/* Online status indicator */}
                                <div className="absolute -bottom-1 -right-1 size-4 animate-pulse rounded-full border-2 border-white bg-green-500 shadow-lg">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-green-400"></div>
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-neutral-800 transition-colors duration-300 group-hover:text-primary-500">
                                    {selectedStudent.name}
                                </h3>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="transition-all duration-300 group-hover:scale-105">
                                        <div className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1">
                                            <div className="size-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs font-medium uppercase text-green-700">
                                                ACTIVE
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="size-1.5 animate-bounce rounded-full bg-primary-400"></div>
                                        <div className="size-1.5 animate-bounce rounded-full bg-primary-400 delay-75"></div>
                                        <div className="size-1.5 animate-bounce rounded-full bg-primary-400 delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content based on selected category */}
                    {category === 'overview' && (
                        <div className="animate-fadeIn flex flex-col gap-3 text-neutral-600">
                            {/* Edit Button */}
                            <div className="flex justify-center">
                                <button className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-6 py-2 font-medium text-neutral-700 hover:bg-neutral-50">
                                    <span className="text-primary-500">✏️</span>
                                    Edit Details
                                </button>
                            </div>

                            {/* Session Expiry Card */}
                            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                                <div className="mb-2 flex items-center gap-2.5">
                                    <div className="rounded-md bg-gradient-to-br from-primary-50 to-primary-100 p-1.5">
                                        <Clock className="text-primary-600 size-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-0.5 text-xs font-medium text-neutral-700">
                                            Session Expiry
                                        </h4>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-primary-600 text-base font-bold">
                                                {daysUntilExpiry}
                                            </span>
                                            <span className="text-xs text-neutral-500">days</span>
                                        </div>
                                    </div>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-primary-500"
                                    >
                                        <path d="M7 17l9.2-9.2M17 17V7H7" />
                                    </svg>
                                </div>
                                <div className="relative mt-2">
                                    <div className="h-2 w-3/5 rounded-full bg-primary-500"></div>
                                    <div className="mt-1 text-center text-[10px] leading-tight text-neutral-500">
                                        Renewal due soon
                                    </div>
                                </div>
                            </div>

                            {/* Account Credentials */}
                            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="rounded-md bg-gradient-to-br from-neutral-50 to-neutral-100 p-1.5">
                                            <Key className="size-4 text-neutral-600" />
                                        </div>
                                        <h4 className="text-xs font-medium text-neutral-700">
                                            Account Credentials
                                        </h4>
                                    </div>
                                    <button className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
                                        <Shield className="size-3" />
                                        Share
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Username: {selectedStudent.username}
                                            </p>
                                        </div>
                                        <button className="text-neutral-400 hover:text-neutral-600">
                                            <Copy className="size-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Password: 123456
                                            </p>
                                        </div>
                                        <button className="text-neutral-400 hover:text-neutral-600">
                                            <Copy className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* General Details */}
                            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                                <div className="mb-2 flex items-center gap-2.5">
                                    <div className="rounded-md bg-gradient-to-br from-primary-50 to-primary-100 p-1.5">
                                        <GraduationCap className="text-primary-600 size-4" />
                                    </div>
                                    <h4 className="text-xs font-medium text-neutral-700">
                                        General Details
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Course: {selectedStudent.batch.split(' ')[0]}
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Level: 12th standard
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Session: 2025-2026
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Enrollment No: 368053
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">Gender: MALE</p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">School: N/A</p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                                <div className="mb-2 flex items-center gap-2.5">
                                    <div className="rounded-md bg-gradient-to-br from-green-50 to-green-100 p-1.5">
                                        <Phone className="size-4 text-green-600" />
                                    </div>
                                    <h4 className="text-xs font-medium text-neutral-700">
                                        Contact Information
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Mobile No.: 919968858268
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Email Id: {selectedStudent.email}
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Details */}
                            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                                <div className="mb-2 flex items-center gap-2.5">
                                    <div className="rounded-md bg-gradient-to-br from-orange-50 to-orange-100 p-1.5">
                                        <MapPin className="size-4 text-orange-600" />
                                    </div>
                                    <h4 className="text-xs font-medium text-neutral-700">
                                        Location Details
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">State: N/A</p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">City: N/A</p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parent/Guardian's Details */}
                            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                                <div className="mb-2 flex items-center gap-2.5">
                                    <div className="rounded-md bg-gradient-to-br from-purple-50 to-purple-100 p-1.5">
                                        <Users className="size-4 text-purple-600" />
                                    </div>
                                    <h4 className="text-xs font-medium text-neutral-700">
                                        Parent/Guardian&lsquo;s Details
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Father/Male Guardian&lsquo;s Name: N/A
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Mother/Male Guardian&lsquo;s Name: N/A
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Mobile No.: N/A
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md p-1.5 hover:bg-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-neutral-300"></div>
                                            <p className="text-xs text-neutral-600">
                                                Email Id: N/A
                                            </p>
                                        </div>
                                        <div className="text-neutral-400">
                                            <Copy className="size-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {category === 'learningProgress' && (
                        <div className="flex h-40 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
                            <div className="text-neutral-500">
                                <p className="mb-2 text-lg font-medium">Learning Progress</p>
                                <p className="text-sm">
                                    Student progress information will be displayed here
                                </p>
                            </div>
                        </div>
                    )}

                    {category === 'testRecord' && (
                        <div className="flex h-40 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
                            <div className="text-neutral-500">
                                <p className="mb-2 text-lg font-medium">Test Records</p>
                                <p className="text-sm">
                                    Student test records will be displayed here
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </SidebarContent>
        </Sidebar>
    );
};

const classAttendanceData: ClassAttendanceData = {
    '1': [
        {
            id: 1,
            className: 'Algebra Basics',
            date: 'Jan 15, 2024',
            time: '10:00 AM',
            status: 'Present',
        },
        {
            id: 2,
            className: 'Geometry Intro',
            date: 'Jan 16, 2024',
            time: '11:00 AM',
            status: 'Present',
        },
        {
            id: 3,
            className: 'Calculus 101',
            date: 'Jan 17, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 4,
            className: 'Statistics',
            date: 'Jan 18, 2024',
            time: '10:30 AM',
            status: 'Present',
        },
        {
            id: 5,
            className: 'Linear Algebra',
            date: 'Jan 19, 2024',
            time: '11:30 AM',
            status: 'Present',
        },
        {
            id: 6,
            className: 'Trigonometry',
            date: 'Jan 20, 2024',
            time: '09:30 AM',
            status: 'Absent',
        },
    ],
    '2': [
        {
            id: 1,
            className: 'Algebra Basics',
            date: 'Jan 15, 2024',
            time: '10:00 AM',
            status: 'Present',
        },
        {
            id: 2,
            className: 'Geometry Intro',
            date: 'Jan 16, 2024',
            time: '11:00 AM',
            status: 'Present',
        },
        {
            id: 3,
            className: 'Calculus 101',
            date: 'Jan 17, 2024',
            time: '09:00 AM',
            status: 'Absent',
        },
    ],
    '3': [
        {
            id: 1,
            className: 'Algebra Basics',
            date: 'Jan 15, 2024',
            time: '10:00 AM',
            status: 'Absent',
        },
        {
            id: 2,
            className: 'Geometry Intro',
            date: 'Jan 16, 2024',
            time: '11:00 AM',
            status: 'Present',
        },
        {
            id: 3,
            className: 'Calculus 101',
            date: 'Jan 17, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
    ],
    '4': [
        {
            id: 1,
            className: 'Advanced Physics',
            date: 'Feb 10, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 2,
            className: 'Quantum Mechanics',
            date: 'Feb 12, 2024',
            time: '10:30 AM',
            status: 'Present',
        },
        {
            id: 3,
            className: 'Thermodynamics',
            date: 'Feb 14, 2024',
            time: '11:00 AM',
            status: 'Present',
        },
        {
            id: 4,
            className: 'Electromagnetism',
            date: 'Feb 16, 2024',
            time: '09:30 AM',
            status: 'Absent',
        },
        {
            id: 5,
            className: 'Optics',
            date: 'Feb 18, 2024',
            time: '10:00 AM',
            status: 'Present',
        },
        {
            id: 6,
            className: 'Nuclear Physics',
            date: 'Feb 20, 2024',
            time: '11:30 AM',
            status: 'Present',
        },
        {
            id: 7,
            className: 'Relativity',
            date: 'Feb 22, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 8,
            className: 'Astrophysics',
            date: 'Feb 24, 2024',
            time: '10:30 AM',
            status: 'Present',
        },
        {
            id: 9,
            className: 'Particle Physics',
            date: 'Feb 26, 2024',
            time: '11:00 AM',
            status: 'Present',
        },
        {
            id: 10,
            className: 'Fluid Mechanics',
            date: 'Feb 28, 2024',
            time: '09:30 AM',
            status: 'Absent',
        },
    ],
    '5': [
        {
            id: 1,
            className: 'Organic Chemistry',
            date: 'Mar 05, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 2,
            className: 'Inorganic Chemistry',
            date: 'Mar 07, 2024',
            time: '10:30 AM',
            status: 'Present',
        },
        {
            id: 3,
            className: 'Physical Chemistry',
            date: 'Mar 09, 2024',
            time: '11:00 AM',
            status: 'Present',
        },
        {
            id: 4,
            className: 'Analytical Chemistry',
            date: 'Mar 11, 2024',
            time: '09:30 AM',
            status: 'Present',
        },
        {
            id: 5,
            className: 'Biochemistry',
            date: 'Mar 13, 2024',
            time: '10:00 AM',
            status: 'Present',
        },
        {
            id: 6,
            className: 'Environmental Chemistry',
            date: 'Mar 15, 2024',
            time: '11:30 AM',
            status: 'Present',
        },
        {
            id: 7,
            className: 'Polymer Chemistry',
            date: 'Mar 17, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 8,
            className: 'Medicinal Chemistry',
            date: 'Mar 19, 2024',
            time: '10:30 AM',
            status: 'Present',
        },
        {
            id: 9,
            className: 'Nuclear Chemistry',
            date: 'Mar 21, 2024',
            time: '11:00 AM',
            status: 'Present',
        },
        {
            id: 10,
            className: 'Computational Chemistry',
            date: 'Mar 23, 2024',
            time: '09:30 AM',
            status: 'Present',
        },
    ],
    '6': [
        {
            id: 1,
            className: 'Cell Biology',
            date: 'Apr 02, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 2,
            className: 'Molecular Biology',
            date: 'Apr 04, 2024',
            time: '10:30 AM',
            status: 'Absent',
        },
        {
            id: 3,
            className: 'Genetics',
            date: 'Apr 06, 2024',
            time: '11:00 AM',
            status: 'Present',
        },
        {
            id: 4,
            className: 'Microbiology',
            date: 'Apr 08, 2024',
            time: '09:30 AM',
            status: 'Absent',
        },
        {
            id: 5,
            className: 'Immunology',
            date: 'Apr 10, 2024',
            time: '10:00 AM',
            status: 'Present',
        },
        {
            id: 6,
            className: 'Ecology',
            date: 'Apr 12, 2024',
            time: '11:30 AM',
            status: 'Absent',
        },
        {
            id: 7,
            className: 'Evolutionary Biology',
            date: 'Apr 14, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 8,
            className: 'Physiology',
            date: 'Apr 16, 2024',
            time: '10:30 AM',
            status: 'Absent',
        },
    ],
    '7': [
        {
            id: 1,
            className: 'Data Structures',
            date: 'May 03, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 2,
            className: 'Algorithms',
            date: 'May 05, 2024',
            time: '10:30 AM',
            status: 'Present',
        },
        {
            id: 3,
            className: 'Database Systems',
            date: 'May 07, 2024',
            time: '11:00 AM',
            status: 'Absent',
        },
        {
            id: 4,
            className: 'Operating Systems',
            date: 'May 09, 2024',
            time: '09:30 AM',
            status: 'Present',
        },
        {
            id: 5,
            className: 'Computer Networks',
            date: 'May 11, 2024',
            time: '10:00 AM',
            status: 'Present',
        },
        {
            id: 6,
            className: 'Artificial Intelligence',
            date: 'May 13, 2024',
            time: '11:30 AM',
            status: 'Present',
        },
        {
            id: 7,
            className: 'Machine Learning',
            date: 'May 15, 2024',
            time: '09:00 AM',
            status: 'Present',
        },
        {
            id: 8,
            className: 'Computer Graphics',
            date: 'May 17, 2024',
            time: '10:30 AM',
            status: 'Absent',
        },
    ],
    '8': [
        {
            id: 1,
            className: 'World History',
            date: 'Jun 01, 2024',
            time: '09:00 AM',
            status: 'Absent',
        },
        {
            id: 2,
            className: 'Geography',
            date: 'Jun 03, 2024',
            time: '10:30 AM',
            status: 'Absent',
        },
        {
            id: 3,
            className: 'Political Science',
            date: 'Jun 05, 2024',
            time: '11:00 AM',
            status: 'Absent',
        },
        {
            id: 4,
            className: 'Economics',
            date: 'Jun 07, 2024',
            time: '09:30 AM',
            status: 'Absent',
        },
        {
            id: 5,
            className: 'Sociology',
            date: 'Jun 09, 2024',
            time: '10:00 AM',
            status: 'Absent',
        },
    ],
};

// Mock data for student attendance
const mockStudentData = [
    {
        id: '1',
        name: 'John Smith',
        username: 'john5553',
        batch: '7th course 3',
        mobileNumber: '+1-9876543210',
        email: 'john.smith@email.com',
        attendedClasses: 5,
        totalClasses: 6,
        attendancePercentage: 83,
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        username: 'sarah4708',
        batch: '7th course 3',
        mobileNumber: '+44-712345678901',
        email: 'sarah.johnson@email.com',
        attendedClasses: 2,
        totalClasses: 3,
        attendancePercentage: 67,
    },
    {
        id: '3',
        name: 'Mike Davis',
        username: 'mike5737',
        batch: '7th course 3',
        mobileNumber: '+91-9123456789',
        email: 'mike.davis@email.com',
        attendedClasses: 2,
        totalClasses: 3,
        attendancePercentage: 67,
    },
    {
        id: '4',
        name: 'Emma Wilson',
        username: 'emma2234',
        batch: '8th course 2',
        mobileNumber: '+1-8765432109',
        email: 'emma.wilson@email.com',
        attendedClasses: 8,
        totalClasses: 10,
        attendancePercentage: 80,
    },
    {
        id: '5',
        name: 'Raj Patel',
        username: 'raj9876',
        batch: '8th course 2',
        mobileNumber: '+91-8765432109',
        email: 'raj.patel@email.com',
        attendedClasses: 10,
        totalClasses: 10,
        attendancePercentage: 100,
    },
    {
        id: '6',
        name: 'Sophia Chen',
        username: 'sophia3456',
        batch: '9th course 1',
        mobileNumber: '+86-1234567890',
        email: 'sophia.chen@email.com',
        attendedClasses: 3,
        totalClasses: 8,
        attendancePercentage: 38,
    },
    {
        id: '7',
        name: 'Carlos Rodriguez',
        username: 'carlos7890',
        batch: '9th course 1',
        mobileNumber: '+34-6123456789',
        email: 'carlos.rodriguez@email.com',
        attendedClasses: 6,
        totalClasses: 8,
        attendancePercentage: 75,
    },
    {
        id: '8',
        name: 'Aisha Khan',
        username: 'aisha4321',
        batch: '10th course 4',
        mobileNumber: '+92-3001234567',
        email: 'aisha.khan@email.com',
        attendedClasses: 0,
        totalClasses: 5,
        attendancePercentage: 0,
    },
];

// Attendance Modal Component
interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: (typeof mockStudentData)[0] | null;
}

const AttendanceModal = ({ isOpen, onClose, student }: AttendanceModalProps) => {
    if (!student) return null;

    const studentClasses = classAttendanceData[student.id] || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[75vh] flex-col sm:max-w-[450px]">
                <div className="flex items-center justify-between border-b border-neutral-200 p-4">
                    <h2 className="text-lg font-semibold text-neutral-800">
                        {student.name} - Class Attendance
                    </h2>
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto p-4">
                    {/* Overall Attendance */}
                    <div className="rounded-lg bg-primary-50 p-4 text-center">
                        <div className="text-4xl font-bold text-primary-500">
                            {student.attendancePercentage}%
                        </div>
                        <div className="mt-2 text-base text-neutral-600">Overall Attendance</div>
                    </div>

                    {/* Class List */}
                    <div className="flex flex-col gap-3 overflow-y-auto">
                        {studentClasses.map((classItem) => (
                            <div
                                key={classItem.id}
                                className="rounded-lg border border-neutral-200 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-neutral-800">
                                            {classItem.className}
                                        </h3>
                                        <p className="text-sm text-neutral-600">
                                            {classItem.date} • {classItem.time}
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            classItem.status === 'Present'
                                                ? 'bg-success-50 text-success-600'
                                                : 'bg-danger-100 text-danger-600'
                                        }`}
                                    >
                                        {classItem.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

function RouteComponent() {
    // State for filters
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All Batches');
    const [selectedClass, setSelectedClass] = useState('All Live Classes');
    const [attendanceFilter, setAttendanceFilter] = useState('All');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Pagination state
    const pageSize = 5;
    const [page, setPage] = useState(0);

    // Row selection state for checkbox column
    const [rowSelections, setRowSelections] = useState<Record<string, boolean>>({});

    // Sorting state
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>(
        {
            key: null,
            direction: 'asc',
        }
    );

    // handleSort removed; dropdown now directly sets sortConfig

    const sortIconFor = (key: string) => {
        if (sortConfig.key !== key) return <CaretUpDown className="inline" />;
        return sortConfig.direction === 'asc' ? (
            <CaretUp className="inline" />
        ) : (
            <CaretDown className="inline" />
        );
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelections: Record<string, boolean> = {};
            paginatedStudents.forEach((s) => {
                newSelections[s.id] = true;
            });
            setRowSelections(newSelections);
        } else {
            setRowSelections({});
        }
    };

    const toggleRowSelection = (id: string, checked: boolean) => {
        setRowSelections((prev) => {
            const newSel = { ...prev };
            if (checked) newSel[id] = true;
            else delete newSel[id];
            return newSel;
        });
    };

    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<(typeof mockStudentData)[0] | null>(
        null
    );

    // State for sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Set the navigation heading
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading('Attendance Tracker');
    }, [setNavHeading]);

    // Function to clear all filters
    const clearFilters = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        setSearchQuery('');
        setSelectedBatch('All Batches');
        setSelectedClass('All Live Classes');
        setAttendanceFilter('All');
    };

    // Function to handle View More click
    const handleViewMoreClick = (student: (typeof mockStudentData)[0]) => {
        setSelectedStudent(student);
        setIsModalOpen(true); // Open modal for attendance view
    };

    // Function to handle student details view (eye icon in first column)
    const handleViewDetailsClick = (student: (typeof mockStudentData)[0]) => {
        setSelectedStudent(student);
        setIsSidebarOpen(true); // Open sidebar for detailed profile
    };

    // Apply filters to student data
    const filteredStudents = useMemo(() => {
        let res = mockStudentData.filter((student) => {
            // Search filter (case-insensitive)
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                searchQuery === '' ||
                student.name.toLowerCase().includes(searchLower) ||
                student.username.toLowerCase().includes(searchLower) ||
                student.email.toLowerCase().includes(searchLower) ||
                student.mobileNumber.toLowerCase().includes(searchLower);

            // Batch filter
            const matchesBatch = selectedBatch === 'All Batches' || student.batch === selectedBatch;

            // Class filter - simplified for mock data
            const matchesClass = selectedClass === 'All Live Classes';

            // Attendance percentage filter
            const matchesAttendance =
                attendanceFilter === 'All' ||
                (attendanceFilter === 'Above 75%' && student.attendancePercentage >= 75) ||
                (attendanceFilter === '50% - 75%' &&
                    student.attendancePercentage >= 50 &&
                    student.attendancePercentage < 75) ||
                (attendanceFilter === 'Below 50%' && student.attendancePercentage < 50);

            return matchesSearch && matchesBatch && matchesClass && matchesAttendance;
        });

        // Apply sorting
        if (sortConfig.key) {
            const dir = sortConfig.direction === 'asc' ? 1 : -1;
            res = [...res].sort((a, b) => {
                const valA = String(a[sortConfig.key as keyof AttendanceStudent]).toLowerCase();
                const valB = String(b[sortConfig.key as keyof AttendanceStudent]).toLowerCase();
                if (valA < valB) return -1 * dir;
                if (valA > valB) return 1 * dir;
                return 0;
            });
        }

        return res;
    }, [searchQuery, selectedBatch, selectedClass, attendanceFilter, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));

    // Ensure page within bounds when filters change
    useEffect(() => {
        if (page >= totalPages) setPage(totalPages - 1);
    }, [totalPages]);

    const paginatedStudents = useMemo(() => {
        const start = page * pageSize;
        return filteredStudents.slice(start, start + pageSize);
    }, [filteredStudents, page]);

    const allRowsSelected =
        paginatedStudents.length > 0 && paginatedStudents.every((s) => rowSelections[s.id]);

    // utility to convert rows to csv and trigger download
    const downloadCSV = (filename: string, rows: string[][]) => {
        const csvContent = rows
            .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportAccountDetails = (students: AttendanceStudent[]) => {
        const headers = ['ID', 'Name', 'Username', 'Batch', 'Mobile Number', 'Email'];
        const rows = [
            headers,
            ...students.map((s) => [s.id, s.name, s.username, s.batch, s.mobileNumber, s.email]),
        ];
        downloadCSV('account_details.csv', rows);
    };

    const exportFullData = (students: AttendanceStudent[]) => {
        const headers = [
            'ID',
            'Name',
            'Username',
            'Batch',
            'Mobile Number',
            'Email',
            'Attended Classes',
            'Total Classes',
            'Attendance %',
        ];
        const rows = [
            headers,
            ...students.map((s) => [
                s.id,
                s.name,
                s.username,
                s.batch,
                s.mobileNumber,
                s.email,
                `${s.attendedClasses}`,
                `${s.totalClasses}`,
                `${s.attendancePercentage}`,
            ]),
        ];
        downloadCSV('attendance_full_data.csv', rows);
    };

    return (
        <StudentSidebarContext.Provider value={{ selectedStudent, setSelectedStudent }}>
            <LayoutContainer>
                <Helmet>
                    <title>Live Class Attendance</title>
                    <meta
                        name="description"
                        content="Track and manage student attendance for live classes"
                    />
                </Helmet>
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-semibold text-neutral-800">
                        Live Class Attendance
                    </h1>
                    <p className="text-neutral-600">
                        Track and manage student attendance for live classes
                    </p>

                    {/* Enhanced Filters Section */}
                    <div className="rounded-lg border border-neutral-200 bg-white p-4">
                        {/* Search and Quick Filters Row */}
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            {/* Search with Icon */}
                            <div className="relative min-w-[240px] flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-neutral-400"
                                    >
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.3-4.3"></path>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>

                            {/* Batch Filter */}
                            <div className="w-[180px]">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={`flex h-9 w-full items-center justify-between overflow-hidden truncate whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                                selectedBatch !== 'All Batches'
                                                    ? 'text-neutral-900'
                                                    : 'text-neutral-500'
                                            }`}
                                        >
                                            {selectedBatch !== 'All Batches' ? (
                                                selectedBatch
                                            ) : (
                                                <>Select batch</>
                                            )}
                                            <CaretDown className="ml-2 size-4 text-neutral-500" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-3" align="start">
                                        <div className="flex flex-col gap-2">
                                            <h4 className="mb-1 text-xs font-medium text-neutral-500">
                                                Select batch
                                            </h4>
                                            {[
                                                'All Batches',
                                                '7th course 3',
                                                '8th course 2',
                                                '9th course 1',
                                                '10th course 4',
                                            ].map((batch) => (
                                                <button
                                                    key={batch}
                                                    onClick={() => setSelectedBatch(batch)}
                                                    className={`w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-left text-xs hover:border-neutral-300 hover:bg-neutral-50 ${
                                                        selectedBatch === batch
                                                            ? 'text-primary-600 bg-primary-50'
                                                            : ''
                                                    }`}
                                                >
                                                    {batch}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Date Range Picker */}
                            <div className="w-[220px]">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={`flex h-9 w-full items-center justify-between overflow-hidden truncate whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                                startDate || endDate
                                                    ? 'text-neutral-900'
                                                    : 'text-neutral-500'
                                            }`}
                                        >
                                            {startDate && endDate ? (
                                                <>
                                                    {format(startDate, 'dd/MM/yy')} -{' '}
                                                    {format(endDate, 'dd/MM/yy')}
                                                </>
                                            ) : startDate ? (
                                                <>From {format(startDate, 'dd/MM/yy')}</>
                                            ) : (
                                                <>Select date range</>
                                            )}
                                            <CalendarIcon className="ml-2 size-4 text-neutral-500" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-3" align="start">
                                        <div className="flex gap-3">
                                            <Calendar
                                                mode="range"
                                                className="border-r border-neutral-100 pr-3"
                                                selected={{
                                                    from: startDate,
                                                    to: endDate,
                                                }}
                                                onSelect={(range) => {
                                                    setStartDate(range?.from);
                                                    setEndDate(range?.to);
                                                }}
                                                initialFocus
                                            />

                                            {/* Quick Presets */}
                                            <div className="flex flex-col gap-2 pt-1">
                                                <h4 className="mb-1 text-xs font-medium text-neutral-500">
                                                    Quick Select
                                                </h4>
                                                {[
                                                    {
                                                        label: 'Past Day',
                                                        from: startOfDay(subDays(new Date(), 1)),
                                                    },
                                                    {
                                                        label: 'Past Week',
                                                        from: startOfDay(subDays(new Date(), 7)),
                                                    },
                                                    {
                                                        label: 'Past Month',
                                                        from: startOfDay(subMonths(new Date(), 1)),
                                                    },
                                                    {
                                                        label: 'Past 6 Months',
                                                        from: startOfDay(subMonths(new Date(), 6)),
                                                    },
                                                    {
                                                        label: 'Past Year',
                                                        from: startOfDay(subYears(new Date(), 1)),
                                                    },
                                                ].map((preset) => (
                                                    <button
                                                        key={preset.label}
                                                        onClick={() => {
                                                            setStartDate(preset.from);
                                                            setEndDate(new Date());
                                                        }}
                                                        className="w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-left text-xs hover:border-neutral-300 hover:bg-neutral-50"
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Attendance Filter */}
                            <div className="w-[180px]">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={`flex h-9 w-full items-center justify-between overflow-hidden truncate whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                                attendanceFilter !== 'All'
                                                    ? 'text-neutral-900'
                                                    : 'text-neutral-500'
                                            }`}
                                        >
                                            {attendanceFilter !== 'All' ? (
                                                attendanceFilter
                                            ) : (
                                                <>Select attendance %</>
                                            )}
                                            <CaretDown className="ml-2 size-4 text-neutral-500" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-3" align="start">
                                        <div className="flex flex-col gap-2">
                                            <h4 className="mb-1 text-xs font-medium text-neutral-500">
                                                Select attendance %
                                            </h4>
                                            {['All', 'Above 75%', '50% - 75%', 'Below 50%'].map(
                                                (filter) => (
                                                    <button
                                                        key={filter}
                                                        onClick={() => setAttendanceFilter(filter)}
                                                        className={`w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-left text-xs hover:border-neutral-300 hover:bg-neutral-50 ${
                                                            attendanceFilter === filter
                                                                ? 'text-primary-600 bg-primary-50'
                                                                : ''
                                                        }`}
                                                    >
                                                        {filter}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Advanced Filters Toggle Button */}
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>

                            {filteredStudents.length !== mockStudentData.length && (
                                <button
                                    onClick={clearFilters}
                                    className="ml-auto inline-flex h-9 items-center justify-center gap-1 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Advanced Filters Section */}
                        {showAdvancedFilters && (
                            <div className="mb-4 rounded-md border border-neutral-100 bg-neutral-50 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <h4 className="text-xs font-medium text-neutral-700">
                                        Advanced Filters
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {/* Class Filter */}
                                    <div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    className={`flex h-8 w-full items-center justify-between overflow-hidden truncate whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                                                        selectedClass !== 'All Live Classes'
                                                            ? 'text-neutral-900'
                                                            : 'text-neutral-500'
                                                    }`}
                                                >
                                                    {selectedClass !== 'All Live Classes' ? (
                                                        selectedClass
                                                    ) : (
                                                        <>Select live class</>
                                                    )}
                                                    <CaretDown className="ml-2 size-4 text-neutral-500" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-3" align="start">
                                                <div className="flex flex-col gap-2">
                                                    <h4 className="mb-1 text-xs font-medium text-neutral-500">
                                                        Select live class
                                                    </h4>
                                                    {[
                                                        'All Live Classes',
                                                        'Physics',
                                                        'Chemistry',
                                                        'Mathematics',
                                                    ].map((classOption) => (
                                                        <button
                                                            key={classOption}
                                                            onClick={() =>
                                                                setSelectedClass(classOption)
                                                            }
                                                            className={`w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-left text-xs hover:border-neutral-300 hover:bg-neutral-50 ${
                                                                selectedClass === classOption
                                                                    ? 'text-primary-600 bg-primary-50'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {classOption}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Students Count */}
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span>
                                Showing{' '}
                                <span className="font-medium text-neutral-700">
                                    {filteredStudents.length}
                                </span>
                                {filteredStudents.length !== mockStudentData.length && (
                                    <>
                                        {' '}
                                        of{' '}
                                        <span className="font-medium text-neutral-700">
                                            {mockStudentData.length}
                                        </span>
                                    </>
                                )}{' '}
                                students
                            </span>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-hidden rounded-lg border border-neutral-200">
                        {/* Table */}
                        <div className="w-full overflow-x-auto">
                            <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full min-w-[800px] table-auto border-collapse">
                                    <thead>
                                        <tr className="relative overflow-visible border-b border-neutral-200 bg-primary-100 text-left text-sm font-medium text-neutral-600">
                                            <th className="w-[40px] px-4 py-6">
                                                <Checkbox
                                                    checked={allRowsSelected}
                                                    onCheckedChange={(val) =>
                                                        toggleSelectAll(!!val)
                                                    }
                                                    className="border-neutral-400 bg-white text-neutral-600 data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                                                />
                                            </th>
                                            <th className="w-[60px] px-4 py-6">Details</th>
                                            <th className="select-none px-4 py-6">
                                                <MyDropdown
                                                    dropdownList={['ASC', 'DESC']}
                                                    onSelect={(val) =>
                                                        setSortConfig({
                                                            key: 'name',
                                                            direction:
                                                                val === 'ASC' ? 'asc' : 'desc',
                                                        })
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1 text-neutral-700 hover:text-neutral-900 focus:outline-none"
                                                        aria-label="Sort learner name"
                                                    >
                                                        <span>Learner Name</span>
                                                        {sortIconFor('name')}
                                                    </button>
                                                </MyDropdown>
                                            </th>
                                            <th className="px-4 py-6">Username</th>
                                            <th className="px-4 py-6">Batch</th>
                                            <th className="px-4 py-6">Mobile Number</th>
                                            <th className="px-4 py-6">Email</th>
                                            <th className="px-4 py-6">
                                                Live Classes and Attendance
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedStudents.length > 0 ? (
                                            paginatedStudents.map((student) => (
                                                <tr
                                                    key={student.id}
                                                    className="border-b border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
                                                >
                                                    <td className="p-4">
                                                        <Checkbox
                                                            checked={!!rowSelections[student.id]}
                                                            onCheckedChange={(val) =>
                                                                toggleRowSelection(
                                                                    student.id,
                                                                    !!val
                                                                )
                                                            }
                                                            className="flex size-4 items-center justify-center border-neutral-400 text-neutral-600 shadow-none data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            className="text-neutral-500 hover:text-primary-500"
                                                            onClick={() =>
                                                                handleViewDetailsClick(student)
                                                            }
                                                        >
                                                            <ArrowSquareOut size={20} />
                                                        </button>
                                                    </td>
                                                    <td className="p-4">{student.name}</td>
                                                    <td className="p-4">{student.username}</td>
                                                    <td className="p-4">{student.batch}</td>
                                                    <td className="p-4">{student.mobileNumber}</td>
                                                    <td className="p-4">{student.email}</td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span>
                                                                {student.attendedClasses}/
                                                                {student.totalClasses} Attended
                                                            </span>
                                                            <div className="mt-1 flex items-center gap-3">
                                                                <button
                                                                    className="flex items-center gap-1 font-medium text-primary-500 hover:underline"
                                                                    onClick={() =>
                                                                        handleViewMoreClick(student)
                                                                    }
                                                                >
                                                                    <Eye size={14} />
                                                                    View More
                                                                </button>
                                                                <div className="h-4 w-px bg-neutral-300"></div>
                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 font-medium ${
                                                                        student.attendancePercentage >=
                                                                        75
                                                                            ? 'bg-success-50 text-success-600'
                                                                            : student.attendancePercentage >=
                                                                                50
                                                                              ? 'bg-warning-50 text-warning-600'
                                                                              : 'bg-danger-50 text-danger-600'
                                                                    }`}
                                                                >
                                                                    {student.attendancePercentage}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="p-8 text-center text-neutral-500"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="40"
                                                            height="40"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="mb-3 text-neutral-300"
                                                        >
                                                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                                            <line
                                                                x1="12"
                                                                y1="9"
                                                                x2="12"
                                                                y2="13"
                                                            ></line>
                                                            <line
                                                                x1="12"
                                                                y1="17"
                                                                x2="12.01"
                                                                y2="17"
                                                            ></line>
                                                        </svg>
                                                        <p className="text-lg font-medium">
                                                            No students found
                                                        </p>
                                                        <p className="mt-1 text-sm">
                                                            Try adjusting your search or filter
                                                            criteria
                                                        </p>
                                                        <button
                                                            className="text-primary-600 mt-4 rounded-md bg-primary-50 px-4 py-2 text-sm font-medium hover:bg-primary-100"
                                                            onClick={clearFilters}
                                                        >
                                                            Clear all filters
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex flex-col gap-4 border-t border-neutral-200 p-4">
                            {/* Bulk Actions Bar */}
                            {Object.keys(rowSelections).length > 0 && (
                                <div className="flex flex-wrap items-center justify-between gap-4 text-neutral-600">
                                    <div className="flex gap-1 text-sm">
                                        [{Object.keys(rowSelections).length}]<span> Selected</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MyButton
                                            buttonType="secondary"
                                            scale="medium"
                                            onClick={() => setRowSelections({})}
                                        >
                                            Reset
                                        </MyButton>

                                        <MyDropdown
                                            dropdownList={['Export Account Details', 'Export Data']}
                                            onSelect={(value) => {
                                                const sel = filteredStudents.filter(
                                                    (s) => rowSelections[s.id]
                                                );
                                                if (value === 'Export Account Details') {
                                                    exportAccountDetails(sel);
                                                } else if (value === 'Export Data') {
                                                    exportFullData(sel);
                                                }
                                            }}
                                        >
                                            <MyButton
                                                buttonType="primary"
                                                scale="medium"
                                                className="flex items-center gap-1"
                                            >
                                                Bulk Actions
                                                <CaretUpDown />
                                            </MyButton>
                                        </MyDropdown>
                                    </div>
                                </div>
                            )}

                            <MyPagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={(p) => setPage(p)}
                            />
                        </div>
                    </div>
                </div>

                {/* Attendance Modal - Keep for backwards compatibility */}
                <AttendanceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    student={selectedStudent}
                />

                {/* Student Details Sidebar with SidebarProvider */}
                <SidebarProvider
                    style={{ ['--sidebar-width' as string]: '565px' }}
                    defaultOpen={false}
                    open={isSidebarOpen}
                    onOpenChange={setIsSidebarOpen}
                >
                    <StudentDetailsSidebar />
                </SidebarProvider>
            </LayoutContainer>
        </StudentSidebarContext.Provider>
    );
}
