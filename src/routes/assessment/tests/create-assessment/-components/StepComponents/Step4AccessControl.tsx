import { StepContentProps } from "@/types/step-content-props";
import React, { useEffect, useState } from "react";
import { useAccessControlForm } from "../../-utils/useAccessControlForm";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { AccessControlFormSchema } from "../../-utils/access-control-form-schema";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Check, Plus, X } from "phosphor-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MyInput } from "@/components/design-system/input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAssessmentDetails } from "../../-services/assessment-services";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { getStepKey } from "../../-utils/helper";

const roles = [
    { roleId: "1", roleName: "Admin", isSelected: false },
    { roleId: "2", roleName: "Editor", isSelected: false },
    { roleId: "3", roleName: "Viewer", isSelected: false },
    { roleId: "4", roleName: "Contributor", isSelected: false },
];

const users = [
    { userId: "u1", email: "john.doe@example.com" },
    { userId: "u2", email: "jane.smith@example.com" },
    { userId: "u3", email: "michael.brown@example.com" },
    { userId: "u4", email: "susan.jones@example.com" },
    { userId: "u5", email: "chris.jackson@example.com" },
];

const Step4AccessControl: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const { instituteDetails } = useInstituteDetailsStore();
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: "1",
            instituteId: instituteDetails?.id,
            type: "EXAM",
        }),
    );
    console.log(completedSteps);
    const form = useAccessControlForm();
    const { handleSubmit } = form;
    const onSubmit = (data: z.infer<typeof AccessControlFormSchema>) => {
        console.log(data);
        handleCompleteCurrentStep();
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    if (isLoading) return <DashboardLoader />;

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Access Control</h1>
                    <MyButton type="submit" scale="large" buttonType="primary">
                        Next
                    </MyButton>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col gap-4">
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "creation_access",
                    }) === "REQUIRED" && (
                        <AccessControlCards
                            heading="Assessment Creation Access"
                            keyVal="assessment_creation_access"
                        />
                    )}
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "live_assessment_access",
                    }) === "REQUIRED" && (
                        <AccessControlCards
                            heading="Live Assessment Notification"
                            keyVal="live_assessment_notification"
                        />
                    )}
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "report_and_submission_access",
                    }) === "REQUIRED" && (
                        <AccessControlCards
                            heading="Assessment Submission & Report Access"
                            keyVal="assessment_submission_and_report_access"
                        />
                    )}
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "evaluation_access",
                    }) === "REQUIRED" && (
                        <AccessControlCards
                            heading="Evaluation Process"
                            keyVal="evaluation_process"
                        />
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

const AccessControlCards = ({
    heading,
    keyVal,
}: {
    heading: string;
    keyVal:
        | "assessment_creation_access"
        | "live_assessment_notification"
        | "assessment_submission_and_report_access"
        | "evaluation_process";
}) => {
    const [inviteUserEmailInput, setInviteUserEmailInput] = useState("");
    const form = useAccessControlForm();
    const { getValues, setValue, watch } = form;
    const getKeyVal = getValues(keyVal);
    watch(keyVal);

    const handleRemoveRole = (roleId: string) => {
        setValue(keyVal, {
            ...getValues(keyVal),
            roles: getKeyVal.roles.map((role) =>
                role.roleId === roleId ? { ...role, isSelected: !role.isSelected } : role,
            ),
        });
    };

    const handleRemoveUsers = (userId: string) => {
        setValue(keyVal, {
            ...getValues(keyVal),
            users: getValues(keyVal).users.filter((user) => user.userId !== userId),
        });
    };

    const handleInviteUsers = () => {
        const currentUsers = getValues(keyVal).users || [];
        setValue(keyVal, {
            ...getValues(keyVal),
            users: [
                ...currentUsers,
                { userId: currentUsers.length.toString(), email: inviteUserEmailInput },
            ],
        });
        setInviteUserEmailInput("");
    };

    const handleSelectRole = (roleId: string) => {
        setValue(keyVal, {
            ...getValues(keyVal),
            roles: getKeyVal.roles.map((role) =>
                role.roleId === roleId ? { ...role, isSelected: !role.isSelected } : role,
            ),
        });
    };

    useEffect(() => {
        form.reset({
            assessment_creation_access: {
                roles: [...roles],
                users: [...users],
            },
            live_assessment_notification: {
                roles: [...roles],
                users: [...users],
            },
            assessment_submission_and_report_access: {
                roles: [...roles],
                users: [...users],
            },
            evaluation_process: {
                roles: [...roles],
                users: [...users],
            },
        });
    }, []);

    return (
        <div className="flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
                <h1>{heading}</h1>
                <Dialog>
                    <DialogTrigger>
                        <MyButton type="submit" scale="medium" buttonType="secondary">
                            <Plus size={32} />
                            Add
                        </MyButton>
                    </DialogTrigger>
                    <DialogContent className="!p-0">
                        <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">
                            Add Role/User
                        </h1>
                        <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto px-4">
                            <h1>Roles</h1>
                            <div className="flex flex-wrap gap-4">
                                {getKeyVal.roles.map((role, idx) => {
                                    return (
                                        <Badge
                                            key={idx}
                                            className="cursor-pointer rounded-lg border border-neutral-300 bg-[#FFF4F5] py-1.5 shadow-none"
                                            onClick={() => handleSelectRole(role.roleId)}
                                        >
                                            Role: {role.roleName}
                                            {role.isSelected && <Check className="ml-2 !size-4" />}
                                        </Badge>
                                    );
                                })}
                            </div>
                            <h1>Invite Users</h1>
                            <div className="flex flex-col">
                                <h1 className="text-sm font-thin">
                                    Invite Users Via Email
                                    <span className="text-subtitle text-danger-600">*</span>
                                </h1>
                                <div className="flex w-full items-center justify-between gap-4">
                                    <MyInput
                                        inputType="text"
                                        inputPlaceholder="you@email.com"
                                        input={inviteUserEmailInput}
                                        onChangeFunction={(e) =>
                                            setInviteUserEmailInput(e.target.value)
                                        }
                                        size="large"
                                        className="!w-80 min-w-60"
                                    />
                                    <MyButton
                                        type="button"
                                        scale="medium"
                                        buttonType="secondary"
                                        onClick={handleInviteUsers}
                                        disable={!inviteUserEmailInput}
                                    >
                                        Invite
                                    </MyButton>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                {getKeyVal.users.map((user, idx) => {
                                    return (
                                        <Badge
                                            key={idx}
                                            className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none"
                                        >
                                            User: {user.email}
                                            <X
                                                className="ml-2 !size-3 cursor-pointer font-bold"
                                                onClick={() => handleRemoveUsers(user.userId)}
                                            />
                                        </Badge>
                                    );
                                })}
                            </div>
                            <div className="my-4 flex justify-end">
                                <DialogClose>
                                    <MyButton type="button" scale="large" buttonType="primary">
                                        Done
                                    </MyButton>
                                </DialogClose>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex flex-wrap gap-4">
                {getKeyVal.roles.map((role, idx) => {
                    if (role.isSelected) {
                        return (
                            <Badge
                                key={idx}
                                className="rounded-lg border border-neutral-300 bg-[#FFF4F5] py-1.5 shadow-none"
                            >
                                Role: {role.roleName}
                                <X
                                    className="ml-2 !size-3 cursor-pointer font-bold"
                                    onClick={() => handleRemoveRole(role.roleId)}
                                />
                            </Badge>
                        );
                    }
                    return null;
                })}
                {getKeyVal.roles.some((role) => role.isSelected) &&
                    getKeyVal.users.map((user, idx) => {
                        return (
                            <Badge
                                key={idx}
                                className="rounded-lg border border-neutral-300 bg-[#FFFDF5] py-1.5 shadow-none"
                            >
                                User: {user.email}
                                <X
                                    className="ml-2 !size-3 cursor-pointer font-bold"
                                    onClick={() => handleRemoveUsers(user.userId)}
                                />
                            </Badge>
                        );
                    })}
            </div>
        </div>
    );
};

export default Step4AccessControl;
