import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';
import { Card, CardContent } from '@/components/ui/card';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import {
    inviteUsersFormValues,
    inviteUsersSchema,
} from '@/routes/dashboard/-components/InviteUsersComponent';
import { handleInviteUsers } from '@/routes/dashboard/-services/dashboard-services';
import { useMutation } from '@tanstack/react-query';
import { getInstituteId } from '@/constants/helper';
import { toast } from 'sonner';
import { MultiSelectField } from '@/components/design-system/multi-select-field';
import { RoleType } from '@/constants/dummy-data';

interface InviteInstructorFormProps {
    onInviteSuccess: (id: string, name: string, email: string, profilePicId: string) => void;
    onCancel: () => void;
}

const InviteInstructorForm = ({ onInviteSuccess, onCancel }: InviteInstructorFormProps) => {
    const instituteId = getInstituteId();
    const form = useForm<inviteUsersFormValues>({
        resolver: zodResolver(inviteUsersSchema),
        defaultValues: {
            name: '',
            email: '',
            roleType: [],
            batch_subject_mappings: [],
        },
        mode: 'onChange',
    });

    const handleInviteUsersMutation = useMutation({
        mutationFn: ({
            instituteId,
            data,
        }: {
            instituteId: string | undefined;
            data: z.infer<typeof inviteUsersSchema>;
        }) => handleInviteUsers(instituteId, data),
        onSuccess: (res, { data }) => {
            onInviteSuccess(res.id, data.name, data.email, res.profile_pic_file_id || '');
            form.reset();
            toast.success('Instructor invited successfully');
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleSubmit = (values: inviteUsersFormValues) => {
        handleInviteUsersMutation.mutate({
            instituteId,
            data: values,
        });
    };

    return (
        <Card className="border-gray-200">
            <CardContent className="p-3">
                <Form {...form}>
                    <form className="grid gap-3">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder="Full name (First and Last)"
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                            required={true}
                                            error={form.formState.errors.name?.message}
                                            size="large"
                                            label="Full Name"
                                            className="h-8 w-full border-gray-300"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="email"
                                            inputPlaceholder="Enter Email"
                                            input={field.value}
                                            onChangeFunction={field.onChange}
                                            required={true}
                                            error={form.formState.errors.email?.message}
                                            size="large"
                                            label="Email"
                                            className="h-8 w-full border-gray-300"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <MultiSelectField
                            form={form}
                            label="Role Type"
                            name="roleType"
                            options={RoleType}
                            control={form.control}
                            className="w-full"
                        />
                        <div className="mt-3 flex gap-4">
                            <MyButton
                                type="button"
                                buttonType="primary"
                                scale="medium"
                                layoutVariant="default"
                                onClick={form.handleSubmit(handleSubmit)}
                                disable={
                                    !form.watch('name') ||
                                    !form.watch('email') ||
                                    !form.watch('roleType')
                                }
                            >
                                Add Instructor
                            </MyButton>
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                scale="medium"
                                layoutVariant="default"
                                onClick={onCancel}
                            >
                                Cancel
                            </MyButton>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default InviteInstructorForm;
