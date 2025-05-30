// add-course-form.tsx
import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { AddCourseStep1, step1Schema } from './add-course-steps/add-course-step1';
import { AddCourseStep2, step2Schema } from './add-course-steps/add-course-step2';
import { toast } from 'sonner';
import { convertToApiFormat } from '../-utils/helper';
import { useAddCourse } from '@/services/study-library/course-operations/add-course';

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
    const addCourseMutation = useAddCourse();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<CourseFormData>>({});
    const [isOpen, setIsOpen] = useState(false);

    const handleStep1Submit = (data: Step1Data) => {
        console.log('Step 1 data:', data);
        setFormData((prev) => ({ ...prev, ...data }));
        setStep(2);
    };

    const handleStep2Submit = (data: Step2Data) => {
        const finalData = { ...formData, ...data };

        // Format the data using the helper function
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const formattedData = convertToApiFormat(finalData);

        addCourseMutation.mutate(
            { requestData: formattedData },
            {
                onSuccess: () => {
                    toast.success('Course created successfully');
                    setIsOpen(false);
                    setStep(1);
                    setFormData({});
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
