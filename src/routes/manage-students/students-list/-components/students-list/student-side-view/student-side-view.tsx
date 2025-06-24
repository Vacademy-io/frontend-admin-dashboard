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
                className={`sidebar-content flex flex-col bg-white border-l border-neutral-200 text-neutral-700`}
            >
                <SidebarHeader className="border-b border-neutral-100 bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                    <div className="flex flex-col p-4">
                        {/* Header with close button - enhanced with gradient */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full animate-pulse"></div>
                                <h2 className="text-lg font-semibold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
                                    Student Profile
                                </h2>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="group p-2 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <X className="size-5 text-neutral-500 group-hover:text-red-500 transition-colors duration-200" />
                            </button>
                        </div>
                        
                        {/* Enhanced tab navigation with modern design */}
                        <div className="relative flex bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl p-1.5 gap-1 shadow-inner">
                            {/* Animated background indicator */}
                            <div 
                                className={`absolute top-1.5 bottom-1.5 bg-white rounded-lg shadow-lg transition-all duration-300 ease-out ${
                                    category === 'overview' ? 'left-1.5 w-[calc(33.333%-0.5rem)]' :
                                    category === 'learningProgress' ? 'left-[calc(33.333%+0.167rem)] w-[calc(33.333%-0.333rem)]' :
                                    'left-[calc(66.666%+0.833rem)] w-[calc(33.333%-0.5rem)]'
                                }`}
                            ></div>
                            
                            <button
                                className={`relative z-10 flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 group ${
                                    category === 'overview'
                                        ? 'text-primary-600 scale-105'
                                        : 'text-neutral-600 hover:text-neutral-800 hover:scale-102'
                                }`}
                                onClick={() => setCategory('overview')}
                            >
                                <span className="relative">
                                    Overview
                                    {category === 'overview' && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full animate-bounce"></div>
                                    )}
                                </span>
                            </button>
                            <button
                                className={`relative z-10 flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 group ${
                                    category === 'learningProgress'
                                        ? 'text-primary-600 scale-105'
                                        : 'text-neutral-600 hover:text-neutral-800 hover:scale-102'
                                }`}
                                onClick={() => setCategory('learningProgress')}
                            >
                                <span className="relative">
                                    Progress
                                    {category === 'learningProgress' && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full animate-bounce"></div>
                                    )}
                                </span>
                            </button>
                            <button
                                className={`relative z-10 flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 group ${
                                    category === 'testRecord'
                                        ? 'text-primary-600 scale-105'
                                        : 'text-neutral-600 hover:text-neutral-800 hover:scale-102'
                                }`}
                                onClick={() => setCategory('testRecord')}
                            >
                                <span className="relative">
                                    Tests
                                    {category === 'testRecord' && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full animate-bounce"></div>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </SidebarHeader>

                <div className="flex-1 overflow-y-auto">
                    {/* Enhanced student profile header with animations */}
                    <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50/50 to-primary-50/30 relative overflow-hidden">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full transform translate-x-16 -translate-y-16 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-300 rounded-full transform -translate-x-12 translate-y-12 animate-pulse delay-1000"></div>
                        </div>
                        
                        <div className="relative flex items-center gap-4 group">
                            <div className="relative">
                                {/* Enhanced profile image with ring animation */}
                                <div className="size-16 rounded-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                                    {/* Animated ring */}
                                    <div className="absolute inset-0 rounded-full ring-2 ring-primary-500/20 ring-offset-2 ring-offset-white group-hover:ring-primary-500/40 transition-all duration-300"></div>
                                    
                                    {faceLoader ? (
                                        <div className="relative">
                                            <div className="size-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                            <div className="absolute inset-0 size-4 border-2 border-primary-200 rounded-full animate-ping"></div>
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
                                <div className="absolute -bottom-1 -right-1 size-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-neutral-800 truncate group-hover:text-primary-700 transition-colors duration-300">
                                    {selectedStudent?.full_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="transform transition-all duration-300 group-hover:scale-105">
                                        <StatusChips status={selectedStudent?.status || 'INACTIVE'} />
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced content area with smooth transitions */}
                    <div className="p-4 min-h-0 flex-1">
                        <div className="relative w-full h-full">
                            {/* Smooth content transitions */}
                            <div className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
                                category === 'overview' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                            }`}>
                                <div className="animate-fadeIn">
                                    <ErrorBoundary>
                                        <StudentOverview isSubmissionTab={isSubmissionTab} />
                                    </ErrorBoundary>
                                </div>
                            </div>
                            
                            <div className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
                                category === 'learningProgress' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                            }`}>
                                <div className="animate-fadeIn">
                                    <ErrorBoundary>
                                        <StudentLearningProgress isSubmissionTab={isSubmissionTab} />
                                    </ErrorBoundary>
                                </div>
                            </div>
                            
                            <div className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
                                category === 'testRecord' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                            }`}>
                                <div className="animate-fadeIn">
                                    <ErrorBoundary>
                                        <StudentTestRecord
                                            selectedTab={selectedTab}
                                            examType={examType}
                                            isStudentList={isStudentList}
                                        />
                                    </ErrorBoundary>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarContent>
        </Sidebar>
    );
};
