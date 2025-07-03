// add-modules-form.tsx
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { MyButton } from '@/components/design-system/button';
import { Module } from '@/stores/study-library/use-modules-with-chapters-store';

const formSchema = z.object({
    moduleName: z.string().min(1, 'Module name is required'),
    description: z.string().optional(),
    imageFile: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddModulesFormProps {
    initialValues?: Module;
    onSubmitSuccess: (module: Module) => void;
}

export const AddModulesForm = ({ initialValues, onSubmitSuccess }: AddModulesFormProps) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            moduleName: initialValues?.module_name || '',
            description: initialValues?.description || '',
            imageFile: null,
        },
    });

    const onSubmit = (data: FormValues) => {
        const newModule = {
            id: initialValues?.id || '',
            module_name: data.moduleName,
            description: data.description || '',
            status: '',
            thumbnail_id: '',
        };
        onSubmitSuccess(newModule);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="moduleName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Module Name"
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder="Enter Module Name"
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex items-start">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                    >
                        {initialValues ? 'Save Changes' : 'Add'}
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
