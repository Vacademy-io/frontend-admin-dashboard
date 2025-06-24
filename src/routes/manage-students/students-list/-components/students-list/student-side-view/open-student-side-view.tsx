import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { X, Envelope, Phone, MapPin, Calendar, User, IdentificationCard } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useStudentSidebar } from '../../../-context/selected-student-sidebar-context';
import { useGetStudentDetails } from '@/services/get-student-details';
import { DashboardLoader } from '@/components/core/dashboard-loader';

// Enhanced DetailRow component with modern animations
const DetailRow = ({ 
    label, 
    value, 
    icon 
}: { 
    label: string; 
    value?: string; 
    icon?: React.ReactNode 
}) => (
    <div className="group flex items-center py-3 px-3 rounded-xl hover:bg-gradient-to-r hover:from-neutral-50 hover:to-primary-50/30 transition-all duration-300 hover:scale-102 hover:shadow-sm cursor-pointer">
        {icon && (
            <div className="mr-3 text-neutral-500 flex-shrink-0 group-hover:text-primary-500 transition-all duration-300 group-hover:scale-110">
                <div className="relative">
                    {icon}
                    <div className="absolute inset-0 rounded-full bg-primary-500/10 scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
            </div>
        )}
        <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1 group-hover:text-primary-600 transition-colors duration-300">
                {label}
            </div>
            <div className="text-sm text-neutral-800 truncate group-hover:text-neutral-900 transition-colors duration-300 font-medium">
                {value || (
                    <span className="text-neutral-400 italic">Not provided</span>
                )}
            </div>
        </div>
        {/* Subtle arrow indicator */}
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-8px] group-hover:translate-x-0">
            <div className="w-1 h-4 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full"></div>
        </div>
    </div>
);

export const OpenStudentSidebar = () => {
    const { state } = useSidebar();
    const { toggleSidebar } = useSidebar();

    const { selectedStudent } = useStudentSidebar();
    const {
        data: studentDetails,
        isLoading,
        isError,
    } = useGetStudentDetails(selectedStudent?.id || '');

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

    if (isLoading || isError) return <DashboardLoader />;

    return (
        <Sidebar side="right">
            <SidebarContent className="sidebar-content flex flex-col bg-gradient-to-br from-white to-neutral-50/30 border-l border-neutral-200 shadow-xl">
                <SidebarHeader className="border-b border-neutral-100 bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center justify-between p-4">
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
                </SidebarHeader>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Enhanced student name header with animation */}
                    <div className="mb-6 group">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-neutral-800 to-primary-700 bg-clip-text text-transparent mb-3 group-hover:from-primary-600 group-hover:to-primary-800 transition-all duration-300">
                            {studentDetails?.full_name}
                        </h3>
                        <div className="h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent group-hover:via-primary-300 transition-colors duration-300"></div>
                        <div className="mt-2 flex gap-2">
                            <div className="w-2 h-px bg-primary-500 animate-pulse"></div>
                            <div className="w-4 h-px bg-primary-400 animate-pulse delay-75"></div>
                            <div className="w-2 h-px bg-primary-300 animate-pulse delay-150"></div>
                        </div>
                    </div>

                    {/* Animated student details sections */}
                    <div className="space-y-6">
                        {/* Enhanced Contact Information */}
                        <div className="bg-gradient-to-br from-neutral-50/50 to-primary-50/30 rounded-xl p-1 border border-neutral-100/50 hover:border-primary-200/50 transition-all duration-300 hover:shadow-lg group">
                            <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 px-3 pt-2 group-hover:text-primary-600 transition-colors duration-300 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                                Contact Information
                            </h4>
                            <DetailRow 
                                label="Email" 
                                value={studentDetails?.email} 
                                icon={<Envelope size={16} />}
                            />
                            <DetailRow 
                                label="Mobile" 
                                value={studentDetails?.mobile_number} 
                                icon={<Phone size={16} />}
                            />
                        </div>

                        {/* Enhanced Personal Information */}
                        <div className="bg-gradient-to-br from-neutral-50/50 to-blue-50/30 rounded-xl p-1 border border-neutral-100/50 hover:border-blue-200/50 transition-all duration-300 hover:shadow-lg group">
                            <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 px-3 pt-2 group-hover:text-blue-600 transition-colors duration-300 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                Personal Information
                            </h4>
                            <DetailRow 
                                label="Gender" 
                                value={studentDetails?.gender} 
                                icon={<User size={16} />}
                            />
                            <DetailRow 
                                label="Date of Birth" 
                                value={studentDetails?.date_of_birth} 
                                icon={<Calendar size={16} />}
                            />
                        </div>

                        {/* Enhanced Location Information */}
                        <div className="bg-gradient-to-br from-neutral-50/50 to-emerald-50/30 rounded-xl p-1 border border-neutral-100/50 hover:border-emerald-200/50 transition-all duration-300 hover:shadow-lg group">
                            <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 px-3 pt-2 group-hover:text-emerald-600 transition-colors duration-300 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                Location Information
                            </h4>
                            <DetailRow 
                                label="State" 
                                value={studentDetails?.region} 
                                icon={<MapPin size={16} />}
                            />
                            <DetailRow 
                                label="City/Village" 
                                value={studentDetails?.city} 
                                icon={<MapPin size={16} />}
                            />
                            <DetailRow 
                                label="Pin Code" 
                                value={studentDetails?.pin_code} 
                                icon={<IdentificationCard size={16} />}
                            />
                            <DetailRow 
                                label="Address" 
                                value={studentDetails?.address_line} 
                                icon={<MapPin size={16} />}
                            />
                        </div>
                    </div>
                </div>
            </SidebarContent>
        </Sidebar>
    );
};
