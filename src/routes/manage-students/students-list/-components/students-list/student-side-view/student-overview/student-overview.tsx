import { ProgressBar } from '@/components/design-system/progress-bar';
import {
    Key,
    User,
    GraduationCap,
    Phone,
    Envelope,
    MapPin,
    Users,
    Clock,
    TrendUp,
    Shield,
    Bell,
    WhatsappLogo,
    Copy,
    Check,
} from '@phosphor-icons/react';
import { useStudentSidebar } from '@/routes/manage-students/students-list/-context/selected-student-sidebar-context';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OverViewData, OverviewDetailsType } from './overview';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { EditStudentDetails } from './EditStudentDetails';
import { useStudentCredentialsStore } from '@/stores/students/students-list/useStudentCredentialsStore';
import { MyButton } from '@/components/design-system/button';
import { useDialogStore } from '@/routes/manage-students/students-list/-hooks/useDialogStore';
import { useGetStudentDetails } from '@/services/get-student-details';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { StudentTable } from '@/types/student-table-types';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    addUsersToTagByName,
    getUserTags,
    deactivateUserTags,
    type TagItem,
} from '@/services/tag-management';

export const StudentOverview = ({ isSubmissionTab }: { isSubmissionTab?: boolean }) => {
    const { selectedStudent } = useStudentSidebar();

    const [overviewData, setOverviewData] = useState<OverviewDetailsType[] | null>(null);
    const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(0);
    const [copiedField, setCopiedField] = useState<string>('');
    const userId = isSubmissionTab ? selectedStudent?.id : selectedStudent?.user_id;
    const { data: studentDetails, isLoading, isError } = useGetStudentDetails(userId || '');

    const { getDetailsFromPackageSessionId, instituteDetails } = useInstituteDetailsStore();

    const { getCredentials } = useStudentCredentialsStore();
    const [password, setPassword] = useState(
        getCredentials(isSubmissionTab ? selectedStudent?.id || '' : selectedStudent?.user_id || '')
            ?.password || 'password not found'
    );
    const [userTags, setUserTags] = useState<{ active: TagItem[]; inactive: TagItem[] } | null>(
        null
    );
    const [newTagInput, setNewTagInput] = useState('');
    const [tagsLoading, setTagsLoading] = useState(false);
    const {
        openIndividualShareCredentialsDialog,
        openIndividualSendEmailDialog,
        openIndividualSendMessageDialog,
    } = useDialogStore();

    // Copy function with feedback
    const handleCopy = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success(`${fieldName} copied to clipboard!`);
            setTimeout(() => setCopiedField(''), 2000);
        } catch (error) {
            toast.error(`Failed to copy ${fieldName}`);
        }
    };

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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
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
            father_mobile_number: '',
            father_email: '',
            mother_mobile_number: '',
            mother_email: '',
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
            country: studentDetails?.country || '',
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

    useEffect(() => {
        const loadUserTags = async () => {
            const id = isSubmissionTab ? selectedStudent?.id : selectedStudent?.user_id;
            if (!id) return;
            setTagsLoading(true);
            try {
                const res = await getUserTags(id);
                setUserTags({ active: res.activeTags || [], inactive: res.inactiveTags || [] });
            } catch (e) {
                setUserTags({ active: [], inactive: [] });
            } finally {
                setTagsLoading(false);
            }
        };
        loadUserTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStudent?.id, selectedStudent?.user_id]);

    if (isLoading) {
        return <DashboardLoader />;
    }

    if (isError) {
        return <div>Error fetching student details</div>;
    }

    return (
        <div className="animate-fadeIn relative flex flex-col gap-3 text-neutral-600">
            {/* Compact Edit Button */}
            <div className="flex justify-center">
                <EditStudentDetails />
            </div>

            {/* Compact Session Expiry Card */}
            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                <div className="mb-2 flex items-center gap-2.5">
                    <div className="rounded-md bg-gradient-to-br from-primary-50 to-primary-100 p-1.5">
                        <Clock className="text-primary-600 size-4" />
                    </div>
                    <div className="flex-1">
                        <h4 className="mb-0.5 text-xs font-medium text-neutral-700">
                            {getTerminology(ContentTerms.Session, SystemTerms.Session)} Expiry
                        </h4>
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
                    <div className="mt-1 text-center text-[10px] leading-tight text-neutral-500">
                        {daysUntilExpiry >= 180
                            ? 'Active session'
                            : daysUntilExpiry >= 30
                              ? 'Renewal due soon'
                              : 'Urgent renewal required'}
                    </div>
                </div>
            </div>

            {/* Compact Notification Section */}
            <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3 transition-all duration-200 hover:border-primary-200/50 hover:shadow-md">
                <div className="mb-2 flex items-center gap-2.5">
                    <div className="rounded-md bg-gradient-to-br from-blue-50 to-blue-100 p-1.5">
                        <Bell className="size-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-medium text-neutral-700">Send Notification</h4>
                        <p className="text-[10px] text-neutral-500">Email or WhatsApp message</p>
                    </div>
                </div>

                {/* Notification action buttons */}
                <div className="flex gap-2">
                    <MyButton
                        type="button"
                        buttonType="secondary"
                        scale="small"
                        disable={false}
                        onClick={() => {
                            if (selectedStudent) {
                                openIndividualSendEmailDialog(selectedStudent);
                            }
                        }}
                        className="hover:scale-102 group flex flex-1 cursor-pointer items-center justify-center gap-1.5 border border-blue-200 bg-white text-xs text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                        <Envelope className="size-3 transition-transform duration-200 group-hover:scale-110" />
                        Email
                    </MyButton>

                    <MyButton
                        type="button"
                        buttonType="secondary"
                        scale="small"
                        disable={false}
                        onClick={() => {
                            if (selectedStudent) {
                                openIndividualSendMessageDialog(selectedStudent);
                            }
                        }}
                        className="hover:scale-102 group flex flex-1 cursor-pointer items-center justify-center gap-1.5 border border-green-200 bg-white text-xs text-green-700 transition-all duration-200 hover:border-green-300 hover:bg-green-50"
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                        <WhatsappLogo className="size-3 transition-transform duration-200 group-hover:scale-110" />
                        WhatsApp
                    </MyButton>
                </div>
            </div>

            {/* Compact overview sections */}
            <div className="space-y-2.5">
                {/* User Tags section */}
                <div className="rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-purple-600" />
                            <h4 className="text-xs font-semibold text-neutral-700">User Tags</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-neutral-500">Add tag by name</Label>
                            <Input
                                className="h-7 w-40 text-xs"
                                placeholder="e.g. VIP Student"
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                            />
                            <Button
                                size="sm"
                                disabled={tagsLoading || !newTagInput.trim() || !selectedStudent}
                                onClick={async () => {
                                    if (!selectedStudent || !newTagInput.trim()) return;
                                    setTagsLoading(true);
                                    try {
                                        await addUsersToTagByName(newTagInput.trim(), [
                                            isSubmissionTab
                                                ? selectedStudent.id
                                                : selectedStudent.user_id,
                                        ]);
                                        const res = await getUserTags(
                                            isSubmissionTab
                                                ? selectedStudent.id
                                                : selectedStudent.user_id
                                        );
                                        setUserTags({
                                            active: res.activeTags || [],
                                            inactive: res.inactiveTags || [],
                                        });
                                        setNewTagInput('');
                                        toast.success('Tag added');
                                    } catch (e) {
                                        toast.error('Failed to add tag');
                                    } finally {
                                        setTagsLoading(false);
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div>
                            <div className="mb-1 text-[11px] font-medium text-neutral-600">
                                Active Tags
                            </div>
                            {tagsLoading ? (
                                <div className="text-xs text-neutral-500">Loading...</div>
                            ) : userTags && userTags.active.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {userTags.active.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-[11px]"
                                        >
                                            <span>{t.tagName}</span>
                                            {!t.defaultTag && (
                                                <button
                                                    type="button"
                                                    className="text-neutral-500 hover:text-neutral-700"
                                                    onClick={async () => {
                                                        if (!selectedStudent) return;
                                                        setTagsLoading(true);
                                                        try {
                                                            await deactivateUserTags(
                                                                isSubmissionTab
                                                                    ? selectedStudent.id
                                                                    : selectedStudent.user_id,
                                                                [t.id]
                                                            );
                                                            const res = await getUserTags(
                                                                isSubmissionTab
                                                                    ? selectedStudent.id
                                                                    : selectedStudent.user_id
                                                            );
                                                            setUserTags({
                                                                active: res.activeTags || [],
                                                                inactive: res.inactiveTags || [],
                                                            });
                                                            toast.success('Tag removed');
                                                        } catch (err) {
                                                            toast.error('Failed to remove tag');
                                                        } finally {
                                                            setTagsLoading(false);
                                                        }
                                                    }}
                                                    aria-label="Remove tag"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-neutral-500">No active tags</div>
                            )}
                        </div>
                        <div>
                            <div className="mb-1 text-[11px] font-medium text-neutral-600">
                                Inactive Tags
                            </div>
                            {tagsLoading ? (
                                <div className="text-xs text-neutral-500">Loading...</div>
                            ) : userTags && userTags.inactive.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {userTags.inactive.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center gap-1 rounded-full bg-neutral-50 px-2 py-1 text-[11px] text-neutral-500"
                                        >
                                            <span>{t.tagName}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-neutral-500">No inactive tags</div>
                            )}
                        </div>
                    </div>
                </div>
                {selectedStudent != null ? (
                    overviewData?.map((studentDetail, key) => {
                        // Define icons and colors for each section
                        const sectionConfig = {
                            0: {
                                icon: Key,
                                color: 'primary',
                                bg: 'from-primary-50 to-primary-100',
                            },
                            1: {
                                icon: GraduationCap,
                                color: 'blue',
                                bg: 'from-blue-50 to-blue-100',
                            },
                            2: {
                                icon: Phone,
                                color: 'emerald',
                                bg: 'from-emerald-50 to-emerald-100',
                            },
                            3: {
                                icon: MapPin,
                                color: 'orange',
                                bg: 'from-orange-50 to-orange-100',
                            },
                            4: { icon: Users, color: 'purple', bg: 'from-purple-50 to-purple-100' },
                        }[key] || {
                            icon: User,
                            color: 'neutral',
                            bg: 'from-neutral-50 to-neutral-100',
                        };

                        const IconComponent = sectionConfig.icon;

                        return (
                            <div key={key} className="group">
                                <div
                                    className={`hover:border- rounded-lg border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 p-2.5 transition-all duration-200 hover:scale-[1.01] hover:shadow-md${sectionConfig.color}-200/50`}
                                >
                                    {/* Compact section header */}
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`rounded-md bg-gradient-to-br p-1 ${sectionConfig.bg} transition-transform duration-200 group-hover:scale-105`}
                                            >
                                                <IconComponent
                                                    className={`text- size-3.5${sectionConfig.color}-600`}
                                                />
                                            </div>
                                            <h3
                                                className={`group-hover:text- text-xs font-semibold text-neutral-700 transition-colors duration-200${sectionConfig.color}-700`}
                                            >
                                                {studentDetail.heading}
                                            </h3>
                                        </div>

                                        {/* Compact share button for credentials */}
                                        {key === 0 && (
                                            <MyButton
                                                type="button"
                                                buttonType="secondary"
                                                scale="small"
                                                disable={false}
                                                onClick={() => {
                                                    if (selectedStudent) {
                                                        openIndividualShareCredentialsDialog(
                                                            selectedStudent
                                                        );
                                                    }
                                                }}
                                                className="h-auto min-h-0 cursor-pointer px-2 py-1 text-[10px]"
                                                style={{ pointerEvents: 'auto', zIndex: 10 }}
                                            >
                                                <Shield className="mr-1 size-2.5" />
                                                Share
                                            </MyButton>
                                        )}
                                    </div>

                                    {/* Compact content grid */}
                                    <div className="space-y-1">
                                        {studentDetail.content &&
                                        studentDetail.content.length > 0 ? (
                                            studentDetail.content.map((obj, key2) => {
                                                if (!obj) {
                                                    return (
                                                        <div
                                                            key={key2}
                                                            className="group/item flex items-start gap-2 rounded-md px-1.5 py-1"
                                                        >
                                                            <div className="mt-1.5 size-1 shrink-0 rounded-full bg-neutral-300"></div>
                                                            <p className="text-xs italic text-primary-500">
                                                                No data available
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                const parts = obj.split(':');
                                                const fieldName = parts[0]?.trim();
                                                const value = parts.slice(1).join(':').trim();
                                                const canCopy =
                                                    value &&
                                                    value !== 'N/A' &&
                                                    value !== 'password not found' &&
                                                    value !== 'undefined';

                                                return (
                                                    <div
                                                        key={key2}
                                                        className="flex items-start gap-2 rounded-md px-1.5 py-1"
                                                    >
                                                        <div className="mt-1.5 size-1 shrink-0 rounded-full bg-neutral-300"></div>
                                                        <div className="min-w-0 flex-1 text-xs leading-relaxed text-neutral-700">
                                                            <span className="font-medium text-neutral-600">
                                                                {fieldName}:{' '}
                                                            </span>
                                                            <span className="group/value relative inline-flex items-center text-neutral-800">
                                                                <span>{value}</span>
                                                                {canCopy && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (fieldName) {
                                                                                handleCopy(
                                                                                    value,
                                                                                    fieldName
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="ml-2 cursor-pointer rounded-md p-1 hover:bg-neutral-200"
                                                                        style={{
                                                                            pointerEvents: 'auto',
                                                                        }}
                                                                    >
                                                                        {copiedField ===
                                                                        fieldName ? (
                                                                            <Check className="size-3 text-green-600" />
                                                                        ) : (
                                                                            <Copy className="size-3 text-neutral-500 hover:text-neutral-700" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-3 text-center">
                                                <div className="mb-1 text-neutral-400">
                                                    <IconComponent className="mx-auto size-5 opacity-50" />
                                                </div>
                                                <p className="text-xs italic text-neutral-500">
                                                    No details available
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Minimal separator */}
                                {key < (overviewData?.length || 0) - 1 && (
                                    <div className="flex items-center justify-center py-1">
                                        <div className="h-px w-6 bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="py-6 text-center">
                        <div className="mb-2 text-neutral-400">
                            <User className="mx-auto size-8 opacity-50" />
                        </div>
                        <p className="text-xs text-neutral-500">No overview data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};
