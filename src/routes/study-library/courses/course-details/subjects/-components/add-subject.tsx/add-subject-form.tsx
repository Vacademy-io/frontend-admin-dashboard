// add-subject-form.tsx
import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { SubjectType } from '@/stores/study-library/use-study-library-store';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

const formSchema = z.object({
    subjectName: z.string().min(1, 'Subject name is required'),
    imageFile: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddSubjectFormProps {
    onSubmitSuccess: (subject: SubjectType) => void;
    initialValues?: SubjectType;
}

export const AddSubjectForm = ({ onSubmitSuccess, initialValues }: AddSubjectFormProps) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subjectName: initialValues?.subject_name || '',
            imageFile: null,
        },
    });

    const onSubmit = (data: FormValues) => {
        const newSubject: SubjectType = {
            id: initialValues?.id || crypto.randomUUID(),
            subject_name: data.subjectName,
            subject_code: '',
            credit: 0,
            thumbnail_id: '', // Use fileId instead of URL
            created_at: initialValues?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        onSubmitSuccess(newSubject);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="subjectName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label={`${getTerminology(
                                        ContentTerms.Subjects,
                                        SystemTerms.Subjects
                                    )} Name`}
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder={`Enter ${getTerminology(
                                        ContentTerms.Subjects,
                                        SystemTerms.Subjects
                                    )} name`}
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-start gap-6">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="large"
                    >
                        {initialValues ? 'Save Changes' : 'Add'}
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
