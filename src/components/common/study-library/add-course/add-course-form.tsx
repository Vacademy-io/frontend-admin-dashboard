// add-course-form.tsx
import { useRef, useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { AddCourseStep1, step1Schema } from './add-course-steps/add-course-step1';
import { AddCourseStep2, step2Schema } from './add-course-steps/add-course-step2';
import { toast } from 'sonner';
import {
    convertToApiCourseFormat,
    convertToApiCourseFormatUpdate,
    SessionDetails,
    transformCourseData,
} from '../-utils/helper';
import { useAddCourse } from '@/services/study-library/course-operations/add-course';
import { useNavigate } from '@tanstack/react-router';
import { useAddSubject } from '@/routes/study-library/courses/course-details/subjects/-services/addSubject';
import { useAddModule } from '@/routes/study-library/courses/course-details/subjects/modules/-services/add-module';
import { useAddChapter } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/-services/add-chapter';
import { SubjectType } from '@/routes/study-library/courses/course-details/-components/course-details-page';
import { fetchInstituteDetails } from '@/services/student-list-section/getInstituteDetails';
import { BatchForSessionType } from '@/schemas/student/student-list/institute-schema';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '../../layout-container/sidebar/utils';
import { CourseDetailsFormValues } from '@/routes/study-library/courses/course-details/-components/course-details-schema';
import { useUpdateCourse } from '@/services/study-library/course-operations/update-course';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

export interface Level {
    id: string;
    name: string;
}

export interface Session {
    id: string;
    name: string;
    startDate: string;
    levels: Level[];
}

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;

// Combined form data type
export interface CourseFormData extends Step1Data, Step2Data {}

// Main wrapper component
export const AddCourseForm = ({
    isEdit,
    initialCourseData,
}: {
    isEdit?: boolean;
    initialCourseData?: CourseDetailsFormValues;
}) => {
    const { getPackageSessionId } = useInstituteDetailsStore();
    const addSubjectMutation = useAddSubject();
    const addModuleMutation = useAddModule();
    const addChapterMutation = useAddChapter();

    const navigate = useNavigate();
    const addCourseMutation = useAddCourse();
    const updateCourseMutation = useUpdateCourse();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<CourseFormData>>(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        initialCourseData ? transformCourseData(initialCourseData) : {}
    );

    const oldFormData = useRef<Partial<CourseFormData>>(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        initialCourseData ? transformCourseData(initialCourseData) : {}
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleStep1Submit = (data: Step1Data) => {
        setFormData((prev) => ({ ...prev, ...data }));
        setStep(2);
    };

    function findIdByPackageId(data: BatchForSessionType[], packageId: string): string {
        return data
            .filter((item) => item.package_dto?.id === packageId)
            .map((item) => item.id)
            .join(',');
    }

    function retainNewActiveLevels(sessions: SessionDetails[]) {
        return sessions.map((session) => ({
            ...session,
            levels: (session.levels ?? []).filter(
                (level) => level.new_level === false && level.package_session_status === 'ACTIVE'
            ),
        }));
    }

    function findUnmatchedBatchIds(
        sessionsData: SessionDetails[],
        batchesData: BatchForSessionType[],
        courseId?: string
    ): string[] {
        /* ------- build a fast‑lookup map: sessionId → Set(levelIds) ------- */
        const sessionLevelMap = new Map<string, Set<string>>();

        sessionsData.forEach((session) => {
            const levels = session.levels ?? [];
            sessionLevelMap.set(session.id, new Set(levels.map((l) => l.id)));
        });

        /* ------- walk the batches and collect the “missing” ones ------- */
        return batchesData
            .filter((batch) => {
                if (courseId && batch.package_dto?.id !== courseId) return false; // course filter
                const levelSet = sessionLevelMap.get(batch.session.id);
                return !levelSet || !levelSet.has(batch.level.id); // session missing OR level missing
            })
            .map((batch) => batch.id);
    }

    const handleStep2Submit = (data: Step2Data) => {
        setIsCreating(true);
        const newSubject: SubjectType = {
            id: '', // Let backend assign ID
            subject_name: 'DEFAULT',
            subject_code: '',
            credit: 0,
            thumbnail_id: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            modules: [], // Add empty modules array
        };

        const newModule = {
            id: '',
            module_name: 'DEFAULT',
            description: '',
            status: '',
            thumbnail_id: '',
        };

        const newChapter = {
            id: '', // Let backend assign ID
            chapter_name: 'DEFAULT',
            status: 'ACTIVE',
            file_id: '',
            description: '',
            chapter_order: 0,
        };

        const finalData = { ...formData, ...data };

        // Format the data using the helper function
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const formattedData = convertToApiCourseFormat(finalData);
        const formattedDataUpdate = convertToApiCourseFormatUpdate(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            oldFormData.current,
            finalData,
            getPackageSessionId
        );

        const previousSessions = retainNewActiveLevels(formattedDataUpdate.sessions);

        if (isEdit) {
            updateCourseMutation.mutate(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                { requestData: formattedDataUpdate },
                {
                    onSuccess: async () => {
                        const instituteDetails = await fetchInstituteDetails();

                        const unmatchedPackageSessionIds = findUnmatchedBatchIds(
                            previousSessions,
                            instituteDetails?.batches_for_sessions || [],
                            formattedDataUpdate.id
                        );

                        if (formattedData.course_depth === 2) {
                            const subjectResponse = await addSubjectMutation.mutateAsync({
                                subject: newSubject,
                                packageSessionIds: unmatchedPackageSessionIds.join(','),
                            });

                            const moduleResponse = await addModuleMutation.mutateAsync({
                                subjectId: subjectResponse.data.id,
                                packageSessionIds: unmatchedPackageSessionIds.join(','),
                                module: newModule,
                            });

                            await addChapterMutation.mutateAsync({
                                subjectId: subjectResponse.data.id,
                                moduleId: moduleResponse.data.id,
                                commaSeparatedPackageSessionIds:
                                    unmatchedPackageSessionIds.join(','),
                                chapter: newChapter,
                            });
                        } else if (formattedData.course_depth === 3) {
                            const subjectResponse = await addSubjectMutation.mutateAsync({
                                subject: newSubject,
                                packageSessionIds: unmatchedPackageSessionIds.join(','),
                            });

                            await addModuleMutation.mutateAsync({
                                subjectId: subjectResponse.data.id,
                                packageSessionIds: unmatchedPackageSessionIds.join(','),
                                module: newModule,
                            });
                        } else if (formattedData.course_depth === 4) {
                            await addSubjectMutation.mutateAsync({
                                subject: newSubject,
                                packageSessionIds: unmatchedPackageSessionIds.join(','),
                            });
                        }

                        toast.success(
                            `${getTerminology(ContentTerms.Course, SystemTerms.Course)}` +
                                'updated successfully'
                        );
                        setIsOpen(false);
                        setStep(1);
                        setFormData({});
                    },
                    onError: () => {
                        toast.error(
                            `Failed to update ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`
                        );
                        setIsCreating(false);
                    },
                }
            );
        } else {
            addCourseMutation.mutate(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                { requestData: formattedData },
                {
                    onSuccess: async (response) => {
                        try {
                            const instituteDetails = await fetchInstituteDetails();
                            const packageSessionId = findIdByPackageId(
                                instituteDetails?.batches_for_sessions || [],
                                response.data
                            );

                            if (formattedData.course_depth === 2) {
                                const subjectResponse = await addSubjectMutation.mutateAsync({
                                    subject: newSubject,
                                    packageSessionIds: packageSessionId,
                                });

                                const moduleResponse = await addModuleMutation.mutateAsync({
                                    subjectId: subjectResponse.data.id,
                                    packageSessionIds: packageSessionId,
                                    module: newModule,
                                });

                                await addChapterMutation.mutateAsync({
                                    subjectId: subjectResponse.data.id,
                                    moduleId: moduleResponse.data.id,
                                    commaSeparatedPackageSessionIds: packageSessionId,
                                    chapter: newChapter,
                                });
                            } else if (formattedData.course_depth === 3) {
                                const subjectResponse = await addSubjectMutation.mutateAsync({
                                    subject: newSubject,
                                    packageSessionIds: packageSessionId,
                                });

                                await addModuleMutation.mutateAsync({
                                    subjectId: subjectResponse.data.id,
                                    packageSessionIds: packageSessionId,
                                    module: newModule,
                                });
                            } else if (formattedData.course_depth === 4) {
                                await addSubjectMutation.mutateAsync({
                                    subject: newSubject,
                                    packageSessionIds: packageSessionId,
                                });
                            }

                            toast.success(
                                `${getTerminology(ContentTerms.Course, SystemTerms.Course)}` +
                                    'created successfully'
                            );
                            setIsOpen(false);
                            setStep(1);
                            setFormData({});
                            navigate({
                                to: `/study-library/courses/course-details?courseId=${response.data}`,
                            });
                        } catch (err) {
                            toast.error(
                                `Failed to create ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`
                            );
                        } finally {
                            setIsCreating(false);
                        }
                    },
                    onError: () => {
                        toast.error(
                            `Failed to create ${getTerminology(ContentTerms.Course, SystemTerms.Course)}`
                        );
                        setIsCreating(false);
                    },
                }
            );
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="flex w-full ">
                {!isEdit ? (
                    <MyButton
                        type="button"
                        buttonType="secondary"
                        layoutVariant="default"
                        scale="large"
                        id="add-course-button"
                        className="w-full  font-light"
                    >
                        Create {getTerminology(ContentTerms.Course, SystemTerms.Course)} Manually
                    </MyButton>
                ) : (
                    <MyButton
                        type="button"
                        buttonType="secondary"
                        layoutVariant="default"
                        scale="small"
                        className="my-6 bg-white py-5 !font-semibold hover:bg-white"
                    >
                        Edit {getTerminology(ContentTerms.Course, SystemTerms.Course)}
                    </MyButton>
                )}
            </DialogTrigger>
            <DialogContent className="z-[10000] flex !h-[90%] !max-h-[90%] w-[90%] flex-col overflow-hidden p-0">
                <div className="flex h-full flex-col">
                    <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">
                        Create {getTerminology(ContentTerms.Course, SystemTerms.Course)} - Step{' '}
                        {step} of 2
                    </h1>
                    {step === 1 ? (
                        <AddCourseStep1
                            onNext={handleStep1Submit}
                            initialData={formData as Step1Data}
                        />
                    ) : (
                        <AddCourseStep2
                            onBack={handleBack}
                            onSubmit={handleStep2Submit}
                            initialData={formData as Step2Data}
                            isLoading={isCreating}
                            disableCreate={isCreating}
                            isEdit={isEdit}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
