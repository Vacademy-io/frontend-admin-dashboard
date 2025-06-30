// add-course-form.tsx
import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { AddCourseStep1, step1Schema } from './add-course-steps/add-course-step1';
import { AddCourseStep2, step2Schema } from './add-course-steps/add-course-step2';
import { toast } from 'sonner';
import { convertToApiCourseFormat } from '../-utils/helper';
import { useAddCourse } from '@/services/study-library/course-operations/add-course';
import { useNavigate } from '@tanstack/react-router';
import { useAddSubject } from '@/routes/study-library/courses/course-details/subjects/-services/addSubject';
import { useAddModule } from '@/routes/study-library/courses/course-details/subjects/modules/-services/add-module';
import { useAddChapter } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/-services/add-chapter';
import { SubjectType } from '@/routes/study-library/courses/course-details/-components/course-details-page';
import { fetchInstituteDetails } from '@/services/student-list-section/getInstituteDetails';
import { BatchForSessionType } from '@/schemas/student/student-list/institute-schema';

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
export const AddCourseForm = () => {
    const addSubjectMutation = useAddSubject();
    const addModuleMutation = useAddModule();
    const addChapterMutation = useAddChapter();

    const navigate = useNavigate();
    const addCourseMutation = useAddCourse();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<CourseFormData>>({});
    const [isOpen, setIsOpen] = useState(false);

    const handleStep1Submit = (data: Step1Data) => {
        console.log('Step 1 data:', data);
        setFormData((prev) => ({ ...prev, ...data }));
        setStep(2);
    };

    function findIdByPackageId(data: BatchForSessionType[], packageId: string) {
        const result = data?.find((item) => item.package_dto?.id === packageId);
        return result?.id || '';
    }

    const handleStep2Submit = (data: Step2Data) => {
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

        addCourseMutation.mutate(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            { requestData: formattedData },
            {
                onSuccess: async (response) => {
                    const instituteDetails = await fetchInstituteDetails();

                    const packageSessionId = findIdByPackageId(
                        instituteDetails?.batches_for_sessions || [],
                        response.data
                    );

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

                    toast.success('Course created successfully');
                    setIsOpen(false);
                    setStep(1);
                    setFormData({});
                    navigate({
                        to: `/study-library/courses/course-details?courseId=${response.data}`,
                    });
                },
                onError: () => {
                    toast.error('Failed to create course');
                },
            }
        );
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>
                <MyButton
                    type="button"
                    buttonType="secondary"
                    layoutVariant="default"
                    scale="large"
                    id="add-course-button"
                    className="w-[140px] font-light"
                >
                    Create Course Manually
                </MyButton>
            </DialogTrigger>
            <DialogContent className="z-[10000] flex !h-[90%] !max-h-[90%] w-[90%] flex-col overflow-hidden p-0">
                <div className="flex h-full flex-col">
                    <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">
                        Create Course - Step {step} of 2
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
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
