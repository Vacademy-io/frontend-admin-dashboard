// add-course-form.tsx
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';
import { AddCourseStep1, step1Schema } from './add-course-steps/add-course-step1';
import { AddCourseStep2, step2Schema } from './add-course-steps/add-course-step2';
import { toast } from 'sonner';

export interface Session {
    id: string;
    session_name: string;
    status: string;
    start_date?: string;
    new_session?: boolean;
    levels: Level[]; // Add levels array to sessions
}

// Update Level interface (remove sessions)
export interface Level {
    id: string;
    level_name: string;
    duration_in_days: number | null;
    thumbnail_id: string | null;
    new_level?: boolean;
}

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;

// Combined form data type
export interface CourseFormData extends Step1Data, Step2Data {}

// Main wrapper component
export const AddCourseForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<CourseFormData>>({});
    const [isOpen, setIsOpen] = useState(false);

    const handleStep1Submit = (data: Step1Data) => {
        console.log('Step 1 data:', data);
        setFormData((prev) => ({ ...prev, ...data }));
        setStep(2);
    };

    const handleStep2Submit = async (data: Step2Data) => {
        console.log('Step 2 data:', data);
        const finalData = { ...formData, ...data };
        console.log('Final combined data:', finalData);

        try {
            // Format the data according to your API requirements
            const formattedData = {
                course: finalData.course,
                description: finalData.description,
                learningOutcome: finalData.learningOutcome,
                aboutCourse: finalData.aboutCourse,
                targetAudience: finalData.targetAudience,
                coursePreview: finalData.coursePreview,
                courseBanner: finalData.courseBanner,
                courseMedia: finalData.courseMedia,
                levelStructure: finalData.levelStructure,
                hasLevels: finalData.hasLevels === 'yes',
                hasSessions: finalData.hasSessions === 'yes',
                levels: finalData.levels?.map(level => ({
                    name: level.name,
                    sessions: level.sessions.map(session => ({
                        name: session.name,
                        startDate: session.startDate
                    }))
                })),
                globalSessions: finalData.globalSessions?.map(session => ({
                    name: session.name,
                    startDate: session.startDate
                })),
                instructors: finalData.instructors || [],
                publishToCatalogue: finalData.publishToCatalogue
            };

            console.log('Formatted data for API:', formattedData);
            // await createCourse(formattedData);
            toast.success('Course created successfully!');
            setIsOpen(false);
            setStep(1);
            setFormData({});
        } catch (error) {
            console.error('Failed to create course:', error);
            toast.error('Failed to create course. Please try again.');
        }
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
