import { StepContentProps } from "@/types/step-content-props";
import React, { useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { AccessControlFormSchema } from "../../-utils/access-control-form-schema";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Check, Plus, X } from "phosphor-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MyInput } from "@/components/design-system/input";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
    getAssessmentDetails,
    handlePostStep4Data,
    publishAssessment,
} from "../../-services/assessment-services";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { getStepKey, syncStep4DataWithStore } from "../../-utils/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSavedAssessmentStore } from "../../-utils/global-states";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAccessControlStore } from "../../-utils/zustand-global-states/step4-access-control";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useSectionDetailsStore } from "../../-utils/zustand-global-states/step2-add-questions";
import { useTestAccessStore } from "../../-utils/zustand-global-states/step3-adding-participants";
import { useBasicInfoStore } from "../../-utils/zustand-global-states/step1-basic-info";

// Define the type from the schema for better TypeScript inference
type AccessControlFormValues = z.infer<typeof AccessControlFormSchema>;
const Step4AccessControl: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const examType = params.examtype;
    const assessmentId = params.assessmentId;
    const storeDataStep4 = useAccessControlStore((state) => state);
    const { savedAssessmentId, setSavedAssessmentId } = useSavedAssessmentStore();
    const { instituteDetails } = useInstituteDetailsStore();
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId !== "defaultId" ? assessmentId : savedAssessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        }),
    );
    const roles =
        assessmentDetails[currentStep]?.field_options?.roles?.map((role, index) => ({
            roleId: (index + 1).toString(),
            roleName: role.value,
            isSelected: false,
        })) || [];
    const form = useForm<AccessControlFormValues>({
        resolver: zodResolver(AccessControlFormSchema),
        defaultValues: {
            status: completedSteps[currentStep] ? "COMPLETE" : "INCOMPLETE",
            assessment_creation_access: storeDataStep4.assessment_creation_access || {
                roles: [...roles],
                users: [],
            },
            live_assessment_notification: storeDataStep4.live_assessment_notification || {
                roles: [...roles],
                users: [],
            },
            assessment_submission_and_report_access:
                storeDataStep4.assessment_submission_and_report_access || {
                    roles: [...roles],
                    users: [],
                },
            evaluation_process: storeDataStep4.evaluation_process || {
                roles: [...roles],
                users: [],
            },
        },
        mode: "onChange",
    });
    const { handleSubmit } = form;

    const handleSubmitStep4Form = useMutation({
        mutationFn: ({
            data,
            assessmentId,
            instituteId,
            type,
        }: {
            data: z.infer<typeof AccessControlFormSchema>;
            assessmentId: string | null;
            instituteId: string | undefined;
            type: string | undefined;
        }) => handlePostStep4Data(data, assessmentId, instituteId, type),
        onSuccess: async () => {
            syncStep4DataWithStore(form);
            // Reset all Zustand stores
            setSavedAssessmentId("");
            useBasicInfoStore.getState().reset();
            useSectionDetailsStore.getState().reset();
            useTestAccessStore.getState().reset();
            useAccessControlStore.getState().reset();
            toast.success("Your assessment has been saved successfully!", {
                className: "success-toast",
                duration: 2000,
            });
            handleCompleteCurrentStep();
            navigate({
                to: "/assessment/exam",
            });
        },
        onError: (error: unknown) => {
            if (error instanceof AxiosError) {
                toast.error(error.message, {
                    className: "error-toast",
                    duration: 2000,
                });
            } else {
                // Handle non-Axios errors if necessary
                console.error("Unexpected error:", error);
            }
        },
    });

    const onSubmit = (data: z.infer<typeof AccessControlFormSchema>) => {
        handleSubmitStep4Form.mutate({
            data: data,
            assessmentId: savedAssessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        });
    };

    const handlePublishAssessmentMutation = useMutation({
        mutationFn: ({
            assessmentId,
            instituteId,
            type,
        }: {
            assessmentId: string | null;
            instituteId: string | undefined;
            type: string | undefined;
        }) => publishAssessment({ assessmentId, instituteId, type }),
        onSuccess: async () => {
            syncStep4DataWithStore(form);
            setSavedAssessmentId("");
            useBasicInfoStore.getState().reset();
            useSectionDetailsStore.getState().reset();
            useTestAccessStore.getState().reset();
            useAccessControlStore.getState().reset();
            toast.success("Your assessment has been published successfully!", {
                className: "success-toast",
                duration: 2000,
            });
            handleCompleteCurrentStep();
            navigate({
                to: "/assessment/exam",
            });
        },
        onError: (error: unknown) => {
            if (error instanceof AxiosError) {
                toast.error(error.message, {
                    className: "error-toast",
                    duration: 2000,
                });
            } else {
                // Handle non-Axios errors if necessary
                console.error("Unexpected error:", error);
            }
        },
    });

    const handlePublishAssessment = async () => {
        try {
            // Get the form values using form.getValues() or whatever method is appropriate
            const formData = form.getValues(); // or form.data, if applicable

            // Trigger the onSubmit first with the correct form data
            await new Promise<void>((resolve) => {
                onSubmit(formData); // pass the form data here
                resolve();
            });

            // After successful form submission, trigger the publish mutation
            handlePublishAssessmentMutation.mutate({
                assessmentId: savedAssessmentId,
                instituteId: instituteDetails?.id,
                type: examType,
            });
        } catch (error) {
            console.error("Error during form submission or publish mutation", error);
        }
    };
    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    if (isLoading || handleSubmitStep4Form.status === "pending") return <DashboardLoader />;

    return (
        <FormProvider {...form}>
            <form>
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Access Control</h1>
                    <div className="flex items-center gap-6">
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="secondary"
                            onClick={handleSubmit(onSubmit, onInvalid)}
                        >
                            Save
                        </MyButton>
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="primary"
                            onClick={handlePublishAssessment}
                        >
                            Publish
                        </MyButton>
                    </div>
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
                            form={form}
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
                            form={form}
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
                            form={form}
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
                            form={form}
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
    form,
}: {
    heading: string;
    keyVal:
        | "assessment_creation_access"
        | "live_assessment_notification"
        | "assessment_submission_and_report_access"
        | "evaluation_process";
    form: UseFormReturn<AccessControlFormValues>;
}) => {
    const [inviteUserEmailInput, setInviteUserEmailInput] = useState("");
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

    return (
        <div className="flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
                <h1>{heading}</h1>
                <Dialog>
                    <DialogTrigger>
                        <MyButton type="button" scale="medium" buttonType="secondary">
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
                {getKeyVal?.roles?.map((role, idx) => {
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
                {getKeyVal?.roles?.some((role) => role.isSelected) &&
                    getKeyVal?.users?.map((user, idx) => {
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
