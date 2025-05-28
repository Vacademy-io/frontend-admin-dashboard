import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';

// Step 2 Schema
export const step2Schema = z.object({
    price: z.string().optional(),
    duration: z.string().optional(),
    startDate: z.string().optional(),
    maxStudents: z.string().optional(),
});
export type Step2Data = z.infer<typeof step2Schema>;

export const AddCourseStep2 = ({
    onBack,
    onSubmit,
    initialData,
}: {
    onBack: () => void;
    onSubmit: (data: Step2Data) => void;
    initialData?: Step2Data;
}) => {
    const form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: initialData || {
            price: '',
            duration: '',
            startDate: '',
            maxStudents: '',
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex h-[calc(100%-56px)] flex-col"
            >
                <div className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        <h1 className="mb-8">Step 2: Course Details</h1>
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                id="price"
                                                label="Price"
                                                inputType="number"
                                                inputPlaceholder="Enter course price"
                                                className="w-full"
                                                input={field.value}
                                                onChangeFunction={(e) =>
                                                    field.onChange(e.target.value)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                id="duration"
                                                label="Duration (in weeks)"
                                                inputType="number"
                                                inputPlaceholder="Enter course duration"
                                                className="w-full"
                                                input={field.value}
                                                onChangeFunction={(e) =>
                                                    field.onChange(e.target.value)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                id="startDate"
                                                label="Start Date"
                                                inputType="date"
                                                className="w-full"
                                                input={field.value}
                                                onChangeFunction={(e) =>
                                                    field.onChange(e.target.value)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="maxStudents"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                id="maxStudents"
                                                label="Maximum Students"
                                                inputType="number"
                                                inputPlaceholder="Enter maximum number of students"
                                                className="w-full"
                                                input={field.value}
                                                onChangeFunction={(e) =>
                                                    field.onChange(e.target.value)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="sticky bottom-0 mt-auto border-t bg-white px-8 py-4">
                    <div className="flex justify-between">
                        <MyButton
                            type="button"
                            buttonType="secondary"
                            layoutVariant="default"
                            scale="large"
                            onClick={onBack}
                            className="px-8"
                        >
                            Back
                        </MyButton>
                        <MyButton
                            type="submit"
                            buttonType="primary"
                            layoutVariant="default"
                            scale="large"
                            className="px-8"
                        >
                            Create Course
                        </MyButton>
                    </div>
                </div>
            </form>
        </Form>
    );
};
