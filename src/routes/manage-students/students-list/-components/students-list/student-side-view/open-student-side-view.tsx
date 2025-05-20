import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { X } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useStudentSidebar } from '../../../-context/selected-student-sidebar-context';
import { useGetStudentDetails } from '@/services/get-student-details';
import { DashboardLoader } from '@/components/core/dashboard-loader';

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
            <SidebarContent
                className={`sidebar-content flex flex-col gap-10 border-r-2 border-r-neutral-300 bg-primary-50 p-6 text-neutral-600`}
            >
                <SidebarHeader>
                    <div className={`flex flex-col items-center justify-center gap-10`}>
                        <div className={`flex w-full items-center justify-between`}>
                            <div className="text-h3 font-semibold text-primary-500">
                                Student Profile
                            </div>
                            <X
                                className="size-6 cursor-pointer text-neutral-500"
                                onClick={() => {
                                    toggleSidebar();
                                }}
                            />
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarMenu className="no-scrollbar flex w-full flex-col gap-10 overflow-y-scroll">
                    <SidebarMenuItem className="flex w-full flex-col gap-6">
                        <div className="flex w-full flex-col items-start justify-center gap-4">
                            <h1 className="text-lg font-semibold">{studentDetails?.full_name}</h1>
                            <span className="text-sm">
                                Email: <span>{studentDetails?.email}</span>{' '}
                            </span>
                            <span className="text-sm">
                                Mobile: <span>{studentDetails?.mobile_number}</span>{' '}
                            </span>
                            <span className="text-sm">
                                State: <span>{studentDetails?.region}</span>{' '}
                            </span>
                            <span className="text-sm">
                                City/Village: <span>{studentDetails?.city}</span>{' '}
                            </span>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
};
