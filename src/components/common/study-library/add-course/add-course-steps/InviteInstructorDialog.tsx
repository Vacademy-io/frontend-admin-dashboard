import { MyButton } from '@/components/design-system/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FormProvider, useForm } from 'react-hook-form';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MyInput } from '@/components/design-system/input';
import MultiSelectDropdown from '@/components/design-system/multiple-select-field';
import { toast } from 'sonner';

const inviteInstructorSchema = z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    roleType: z.array(z.string()).default(['TEACHER']),
});

export type InviteInstructorFormValues = z.infer<typeof inviteInstructorSchema>;

interface InviteInstructorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInviteSuccess: (email: string) => void;
}

const InviteInstructorDialog = ({ open, onOpenChange, onInviteSuccess }: InviteInstructorDialogProps) => {
    console.log("Dialog render - open state:", open);

    const form = useForm<InviteInstructorFormValues>({
        resolver: zodResolver(inviteInstructorSchema),
        defaultValues: {
            name: '',
            email: '',
            roleType: ['TEACHER'],
        },
        mode: 'onChange',
    });

    const { getValues } = form;
    const isValid = !!getValues('name') && !!getValues('email');

    function onSubmit(values: InviteInstructorFormValues) {
        console.log('Submitting instructor:', values);
        // Here you would typically make an API call to invite the instructor
        toast.success('Instructor invited successfully');
        onInviteSuccess(values.email);
        form.reset();
        onOpenChange(false);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                console.log("Dialog onOpenChange called with:", newOpen);
                onOpenChange(newOpen);
            }}
        >
            <DialogContent className="flex max-h-[600px] w-[420px] flex-col overflow-y-scroll p-0">
                <h1 className="rounded-t-md bg-primary-50 p-4 font-semibold text-primary-500">
                    Invite Instructor
                </h1>
                <FormProvider {...form}>
                    <form className="flex flex-col items-start justify-center gap-4 px-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder="Full name (First and Last)"
                                            input={value}
                                            onChangeFunction={onChange}
                                            required={true}
                                            error={form.formState.errors.name?.message}
                                            size="large"
                                            label="Full Name"
                                            {...field}
                                            className="w-96"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="email"
                                            inputPlaceholder="Enter Email"
                                            input={value}
                                            onChangeFunction={onChange}
                                            required={true}
                                            error={form.formState.errors.email?.message}
                                            size="large"
                                            label="Email"
                                            {...field}
                                            className="w-96"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <MultiSelectDropdown
                            form={form}
                            label="Role Type"
                            name="roleType"
                            options={[{ value: 'TEACHER', label: 'Teacher', _id: 0 }]}
                            control={form.control}
                            className="w-96"
                            required
                        />
                        <div className="flex w-96 items-center justify-center text-center">
                            <MyButton
                                type="button"
                                scale="large"
                                buttonType="primary"
                                layoutVariant="default"
                                className="mb-6"
                                disable={!isValid}
                                onClick={form.handleSubmit(onSubmit)}
                            >
                                Invite Instructor
                            </MyButton>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
};

export default InviteInstructorDialog;
