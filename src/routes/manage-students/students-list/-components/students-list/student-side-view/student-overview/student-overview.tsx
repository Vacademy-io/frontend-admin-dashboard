import { SidebarMenuItem } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ProgressBar } from '@/components/design-system/progress-bar';
import { 
    Key, 
    User, 
    GraduationCap, 
    Phone, 
    Envelope, 
    MapPin, 
    Users,
    Calendar,
    Clock,
    TrendUp,
    Shield
} from '@phosphor-icons/react';
import { useStudentSidebar } from '@/routes/manage-students/students-list/-context/selected-student-sidebar-context';
import { useEffect, useState } from 'react';
import { OverViewData, OverviewDetailsType } from './overview';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { EditStudentDetails } from './EditStudentDetails';
import { useStudentCredentialsStore } from '@/stores/students/students-list/useStudentCredentialsStore';
import { MyButton } from '@/components/design-system/button';
import { useDialogStore } from '@/routes/manage-students/students-list/-hooks/useDialogStore';
import { useGetStudentDetails } from '@/services/get-student-details';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { StudentTable } from '@/types/student-table-types';

export const StudentOverview = ({ isSubmissionTab }: { isSubmissionTab?: boolean }) => {
    const { selectedStudent } = useStudentSidebar();

    const [overviewData, setOverviewData] = useState<OverviewDetailsType[] | null>(null);
    const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(0);
    const userId = isSubmissionTab ? selectedStudent?.id : selectedStudent?.user_id;
    const { data: studentDetails, isLoading, isError } = useGetStudentDetails(userId || '');

    const { getDetailsFromPackageSessionId, instituteDetails } = useInstituteDetailsStore();

    const { getCredentials } = useStudentCredentialsStore();
    const [password, setPassword] = useState(
        getCredentials(isSubmissionTab ? selectedStudent?.id || '' : selectedStudent?.user_id || '')
            ?.password || 'password not found'
    );
    const { openIndividualShareCredentialsDialog } = useDialogStore();

    useEffect(() => {
        if (selectedStudent) {
            const credentials = getCredentials(
                isSubmissionTab ? selectedStudent.id : selectedStudent.user_id
            );
            setPassword(credentials?.password || 'password not found');
        }
    }, [selectedStudent]);

    useEffect(() => {
        const details = getDetailsFromPackageSessionId({
            packageSessionId: isSubmissionTab
                ? selectedStudent?.package_id || ''
                : selectedStudent?.package_session_id || '',
        });
        const student: StudentTable | null = {
            id: studentDetails?.id || '',
            username: studentDetails?.username || '',
            user_id: selectedStudent?.id || '',
            email: studentDetails?.email || '',
            full_name: studentDetails?.full_name || '',
            address_line: studentDetails?.address_line || '',
            region: studentDetails?.region || '',
            city: studentDetails?.city || '',
            pin_code: studentDetails?.pin_code || '',
            mobile_number: studentDetails?.mobile_number || '',
            date_of_birth: studentDetails?.date_of_birth || '',
            gender: studentDetails?.gender || '',
            father_name: '',
            mother_name: '',
            parents_mobile_number: '',
            parents_email: '',
            linked_institute_name: '',
            created_at: '',
            updated_at: '',
            package_session_id: '',
            institute_enrollment_id: '',
            status: 'ACTIVE',
            session_expiry_days: 0,
            institute_id: '',
            expiry_date: 0,
            face_file_id: studentDetails?.face_file_id || '',
            attempt_id: '',
            parents_to_mother_mobile_number: '',
            parents_to_mother_email: '',
            package_id: selectedStudent?.package_id || '',
        };

        const learner = isSubmissionTab ? student : selectedStudent;
        setOverviewData(
            OverViewData({
                selectedStudent: learner,
                packageSessionDetails: details,
                password: password,
            })
        );

        // Calculate days until expiry
        if (selectedStudent?.expiry_date) {
            const expiryDate = new Date(selectedStudent.expiry_date);
            const currentDate = new Date();

            // Calculate the difference in milliseconds
            const diffTime = expiryDate.getTime() - currentDate.getTime();

            // Convert to days and round down
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Set the days until expiry (0 if negative)
            setDaysUntilExpiry(diffDays > 0 ? diffDays : 0);
        } else {
            setDaysUntilExpiry(0);
        }
    }, [selectedStudent, instituteDetails, password, studentDetails]);

    if (isLoading) {
        return <DashboardLoader />;
    }

    if (isError) {
        return <div>Error fetching student details</div>;
    }

    return (
        <div className="flex flex-col gap-3 text-neutral-600 animate-fadeIn">
            {/* Compact Edit Button */}
            <div className="flex justify-center">
                <EditStudentDetails />
            </div>

            {/* Compact Session Expiry Card */}
            <div className="bg-gradient-to-br from-white to-neutral-50/30 rounded-lg p-3 border border-neutral-200/50 hover:border-primary-200/50 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-primary-50 to-primary-100">
                        <Clock className="size-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-medium text-neutral-700 mb-0.5">Session Expiry</h4>
                        <div className="flex items-center gap-1.5">
                            <span
                                className={`text-base font-bold ${
                                    daysUntilExpiry >= 180
                                        ? 'text-success-600'
                                        : daysUntilExpiry >= 30
                                          ? 'text-warning-600'
                                          : 'text-danger-600'
                                }`}
                            >
                                {daysUntilExpiry}
                            </span>
                            <span className="text-xs text-neutral-500">days</span>
                        </div>
                    </div>
                    <TrendUp 
                        className={`size-3.5 ${
                            daysUntilExpiry >= 180
                                ? 'text-success-500'
                                : daysUntilExpiry >= 30
                                  ? 'text-warning-500'
                                  : 'text-danger-500'
                        }`} 
                    />
                </div>
                <div className="relative">
                    <ProgressBar progress={daysUntilExpiry} />
                    <div className="mt-1 text-[10px] text-neutral-500 text-center leading-tight">
                        {daysUntilExpiry >= 180 
                            ? 'Active session' 
                            : daysUntilExpiry >= 30 
                              ? 'Renewal due soon' 
                              : 'Urgent renewal required'}
                    </div>
                </div>
            </div>

            {/* Compact overview sections */}
            <div className="space-y-2.5">
                {selectedStudent != null ? (
                    overviewData?.map((studentDetail, key) => {
                        // Define icons and colors for each section
                        const sectionConfig = {
                            0: { icon: Key, color: 'primary', bg: 'from-primary-50 to-primary-100' },
                            1: { icon: GraduationCap, color: 'blue', bg: 'from-blue-50 to-blue-100' },
                            2: { icon: Phone, color: 'emerald', bg: 'from-emerald-50 to-emerald-100' },
                            3: { icon: MapPin, color: 'orange', bg: 'from-orange-50 to-orange-100' },
                            4: { icon: Users, color: 'purple', bg: 'from-purple-50 to-purple-100' },
                        }[key] || { icon: User, color: 'neutral', bg: 'from-neutral-50 to-neutral-100' };

                        const IconComponent = sectionConfig.icon;

                        return (
                            <div key={key} className="group">
                                <div className={`bg-gradient-to-br from-white to-neutral-50/30 rounded-lg p-2.5 border border-neutral-200/50 hover:border-${sectionConfig.color}-200/50 transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}>
                                    {/* Compact section header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded-md bg-gradient-to-br ${sectionConfig.bg} group-hover:scale-105 transition-transform duration-200`}>
                                                <IconComponent className={`size-3.5 text-${sectionConfig.color}-600`} />
                                            </div>
                                            <h3 className={`text-xs font-semibold text-neutral-700 group-hover:text-${sectionConfig.color}-700 transition-colors duration-200`}>
                                                {studentDetail.heading}
                                            </h3>
                                        </div>
                                        
                                        {/* Compact share button for credentials */}
                                        {key === 0 && (
                                            <MyButton
                                                buttonType="secondary"
                                                scale="small"
                                                onClick={() =>
                                                    selectedStudent &&
                                                    openIndividualShareCredentialsDialog(selectedStudent)
                                                }
                                                className="text-[10px] px-2 py-1 h-auto min-h-0"
                                            >
                                                <Shield className="size-2.5 mr-1" />
                                                Share
                                            </MyButton>
                                        )}
                                    </div>

                                    {/* Compact content grid */}
                                    <div className="space-y-1">
                                        {studentDetail.content && studentDetail.content.length > 0 ? (
                                            studentDetail.content.map((obj, key2) => (
                                                <div key={key2} className="group/item flex items-start gap-2 py-1 px-1.5 rounded-md hover:bg-white/60 transition-all duration-150">
                                                    <div className="w-1 h-1 bg-neutral-300 rounded-full mt-1.5 group-hover/item:bg-primary-400 transition-colors duration-150 flex-shrink-0"></div>
                                                    <div className="flex-1 min-w-0">
                                                        {obj == undefined ? (
                                                            <p className="text-xs text-primary-500 italic">
                                                                No data available
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-neutral-700 group-hover/item:text-neutral-900 transition-colors duration-150 leading-relaxed">
                                                                {obj}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-3 text-center">
                                                <div className="text-neutral-400 mb-1">
                                                    <IconComponent className="size-5 mx-auto opacity-50" />
                                                </div>
                                                <p className="text-xs text-neutral-500 italic">
                                                    No details available
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Minimal separator */}
                                {key < (overviewData?.length || 0) - 1 && (
                                    <div className="flex items-center justify-center py-1">
                                        <div className="w-6 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="py-6 text-center">
                        <div className="text-neutral-400 mb-2">
                            <User className="size-8 mx-auto opacity-50" />
                        </div>
                        <p className="text-xs text-neutral-500">No overview data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};
