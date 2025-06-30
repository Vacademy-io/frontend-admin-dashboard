import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { X } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { DummyProfile } from '@/assets/svgs';
import { StatusChips } from '@/components/design-system/chips';
import { StudentOverview } from './student-overview/student-overview';
import { StudentLearningProgress } from './student-learning-progress/student-learning-progress';
import { StudentTestRecord } from './student-test-records/student-test-record';
import { getPublicUrl } from '@/services/upload_file';
import { DashboardLoader, ErrorBoundary } from '@/components/core/dashboard-loader';
import { useStudentSidebar } from '../../../-context/selected-student-sidebar-context';

export const StudentSidebar = ({
    selectedTab,
    examType,
    isStudentList,
    isSubmissionTab,
}: {
    selectedTab?: string;
    examType?: string;
    isStudentList?: boolean;
    isSubmissionTab?: boolean;
}) => {
    const { state } = useSidebar();
    const [category, setCategory] = useState('overview');
    const { toggleSidebar } = useSidebar();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [faceLoader, setFaceLoader] = useState(false);

    const { selectedStudent } = useStudentSidebar();

    useEffect(() => {
        if (state == 'expanded') {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('sidebar-open');
        };
    }, [state]);

    const fetchImageUrl = async () => {
        if (selectedStudent?.face_file_id) {
            try {
                setFaceLoader(true);
                const url = await getPublicUrl(selectedStudent.face_file_id);
                setImageUrl(url);
                setFaceLoader(false);
            } catch (error) {
                console.error('Failed to fetch image URL:', error);
                setFaceLoader(false);
            }
        } else {
            setImageUrl(null);
        }
    };

    useEffect(() => {
        fetchImageUrl();
    }, [selectedStudent, selectedStudent?.face_file_id]);

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
                                <div className="to-primary-600 h-6 w-1 animate-pulse rounded-full bg-gradient-to-b from-primary-500"></div>
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
                                        ? 'text-primary-600 scale-105'
                                        : 'hover:scale-102 text-neutral-600 hover:text-neutral-800'
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
                                        ? 'text-primary-600 scale-105'
                                        : 'hover:scale-102 text-neutral-600 hover:text-neutral-800'
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
                                        ? 'text-primary-600 scale-105'
                                        : 'hover:scale-102 text-neutral-600 hover:text-neutral-800'
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

                                    {faceLoader ? (
                                        <div className="relative">
                                            <div className="size-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                                            <div className="absolute inset-0 size-4 animate-ping rounded-full border-2 border-primary-200"></div>
                                        </div>
                                    ) : imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="Profile"
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <DummyProfile className="size-12 text-neutral-400 transition-colors duration-300 group-hover:text-neutral-600" />
                                    )}
                                </div>

                                {/* Online status indicator */}
                                <div className="absolute -bottom-1 -right-1 size-4 animate-pulse rounded-full border-2 border-white bg-green-500 shadow-lg">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-green-400"></div>
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="group-hover:text-primary-700 truncate font-semibold text-neutral-800 transition-colors duration-300">
                                    {selectedStudent?.full_name}
                                </h3>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="transition-all duration-300 group-hover:scale-105">
                                        <StatusChips status={selectedStudent?.status || 'INACTIVE'} />
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
                    <ErrorBoundary>
                        {category === 'overview' && (
                            <StudentOverview isSubmissionTab={isSubmissionTab} />
                        )}
                        {category === 'learningProgress' && (
                            <StudentLearningProgress isSubmissionTab={isSubmissionTab} />
                        )}
                        {category === 'testRecord' && (
                            <StudentTestRecord
                                selectedTab={selectedTab || ''}
                                examType={examType || ''}
                                isStudentList={isStudentList || false}
                            />
                        )}
                    </ErrorBoundary>
                </div>
            </SidebarContent>
        </Sidebar>
    );
};
