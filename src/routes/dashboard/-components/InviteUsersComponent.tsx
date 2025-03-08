import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MyInput } from "@/components/design-system/input";
import MultiSelectDropdown from "@/components/design-system/multiple-select-field";
import { RoleType } from "@/constants/dummy-data";

export const inviteUsersSchema = z.object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    roleType: z.array(z.string()).min(1, "At least one role type is required"),
});
type FormValues = z.infer<typeof inviteUsersSchema>;

const InviteUsersComponent = () => {
    const form = useForm<FormValues>({
        resolver: zodResolver(inviteUsersSchema),
        defaultValues: {
            name: "",
            email: "",
            roleType: [],
        },
        mode: "onChange",
    });
    const { getValues } = form;
    const isValid =
        !!getValues("name") &&
        !!getValues("email") &&
        (getValues("roleType").length > 0 ? true : false);

    form.watch("roleType");

    function onSubmit(values: FormValues) {
        console.log(values);
    }

    return (
        <Dialog>
            <DialogTrigger>
                <MyButton buttonType="primary" scale="large" layoutVariant="default">
                    Invite Users
                </MyButton>
            </DialogTrigger>
            <DialogContent className="flex flex-col p-0">
                <h1 className="rounded-t-md bg-primary-50 p-4 font-semibold text-primary-500">
                    Invite User
                </h1>
                <FormProvider {...form}>
                    <form className="ml-16 flex flex-col items-start justify-center gap-4">
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
                            options={RoleType.map((option, index) => ({
                                value: option.name,
                                label: option.name,
                                _id: index,
                            }))}
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
                                Invite User
                            </MyButton>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
};

export default InviteUsersComponent;
