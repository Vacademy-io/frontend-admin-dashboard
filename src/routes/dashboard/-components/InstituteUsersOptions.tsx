import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsThree, WarningCircle } from "phosphor-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MultiSelectDropdown from "@/components/design-system/multiple-select-field";
import { RoleType } from "@/constants/dummy-data";
import { UserRolesDataEntry } from "@/types/dashboard/user-roles";
export const inviteUsersSchema = z.object({
    roleType: z.array(z.string()).min(1, "At least one role type is required"),
});
type FormValues = z.infer<typeof inviteUsersSchema>;

interface ChangeRoleTypeComponentProps {
    student: UserRolesDataEntry;
    onClose: () => void;
}

const ChangeRoleTypeComponent: React.FC<ChangeRoleTypeComponentProps> = ({ student, onClose }) => {
    //need to previous already assigned roles
    const form = useForm<FormValues>({
        resolver: zodResolver(inviteUsersSchema),
        defaultValues: {
            roleType: [],
        },
        mode: "onChange",
    });
    const { getValues } = form;
    const isValid = getValues("roleType").length > 0 ? true : false;
    form.watch("roleType");

    function onSubmit(values: FormValues) {
        console.log(values);
        onClose();
    }

    useEffect(() => {
        form.reset({
            roleType: student.roleType || [],
        });
    }, []);

    return (
        <DialogContent className="flex flex-col p-0">
            <h1 className="rounded-md bg-primary-50 p-4 text-primary-500">Change Roles</h1>
            <FormProvider {...form}>
                <form className="ml-16 flex flex-col items-start justify-center gap-4">
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
                            Submit
                        </MyButton>
                    </div>
                </form>
            </FormProvider>
        </DialogContent>
    );
};

interface DisableUserComponentProps {
    student: UserRolesDataEntry;
    onClose: () => void;
}

const DisableUserComponent: React.FC<DisableUserComponentProps> = ({ student, onClose }) => {
    return (
        <DialogContent className="flex flex-col p-0">
            <h1 className="rounded-md bg-primary-50 p-4 text-primary-500">Disable User</h1>
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center text-danger-600">
                    <p>Attention</p>
                    <WarningCircle size={18} />
                </div>
                <h1>
                    Are you sure you want to disable{" "}
                    <span className="text-primary-500">{student.name}</span>?
                </h1>
                <div className="flex justify-end">
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        className="mt-4 font-medium"
                        onClick={onClose} // Close the dialog when clicked
                    >
                        Yes
                    </MyButton>
                </div>
            </div>
        </DialogContent>
    );
};

interface DeleteUserComponentProps {
    student: UserRolesDataEntry;
    onClose: () => void;
}

const DeleteUserComponent: React.FC<DeleteUserComponentProps> = ({ student, onClose }) => {
    return (
        <DialogContent className="flex flex-col p-0">
            <h1 className="rounded-md bg-primary-50 p-4 text-primary-500">Delete User</h1>
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center text-danger-600">
                    <p>Attention</p>
                    <WarningCircle size={18} />
                </div>
                <h1>
                    Are you sure you want to delete{" "}
                    <span className="text-primary-500">{student.name}</span>?
                </h1>
                <div className="flex justify-end">
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        className="mt-4 font-medium"
                        onClick={onClose} // Close the dialog when clicked
                    >
                        Yes
                    </MyButton>
                </div>
            </div>
        </DialogContent>
    );
};

const InstituteUsersOptions = ({ user }: { user: UserRolesDataEntry }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleDropdownMenuClick = (value: string) => {
        setOpenDialog(true);
        setSelectedOption(value);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <p className="cursor-pointer rounded-md border p-[2px]">
                        <DotsThree size={20} />
                    </p>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleDropdownMenuClick("Change Role Type")}>
                        Change Role Type
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDropdownMenuClick("Disable user")}>
                        Disable user
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDropdownMenuClick("Delete user")}>
                        Delete user
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                {selectedOption === "Change Role Type" && (
                    <ChangeRoleTypeComponent student={user} onClose={() => setOpenDialog(false)} />
                )}
                {selectedOption === "Disable user" && (
                    <DisableUserComponent student={user} onClose={() => setOpenDialog(false)} />
                )}
                {selectedOption === "Delete user" && (
                    <DeleteUserComponent student={user} onClose={() => setOpenDialog(false)} />
                )}
            </Dialog>
        </>
    );
};

export default InstituteUsersOptions;
