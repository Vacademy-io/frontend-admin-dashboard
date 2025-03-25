import { StepContentProps } from "@/types/assessments/step-content-props";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { AccessControlFormSchema } from "../../-utils/access-control-form-schema";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "phosphor-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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
import { getInstituteId } from "@/constants/helper";
import {
    fetchInstituteDashboardUsers,
    handleDeleteDisableDashboardUsers,
} from "@/routes/dashboard/-services/dashboard-services";
import { RoleTypeUserIcon } from "@/svgs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import RoleTypeFilterButtons from "@/routes/dashboard/-components/RoleTypeFilterButtons";
import { ScheduleTestFilters } from "@/routes/assessment/assessment-list/-components/ScheduleTestFilters";
import { RoleType } from "@/constants/dummy-data";
import { MyFilterOption } from "@/types/assessments/my-filter";
import { RoleTypeSelectedFilter } from "@/routes/dashboard/-components/RoleTypeComponent";
import { UserRolesDataEntry } from "@/types/dashboard/user-roles";
import Step4InviteUsers from "./-components/Step4InviteUsers";

// Define the type from the schema for better TypeScript inference
type AccessControlFormValues = z.infer<typeof AccessControlFormSchema>;
const Step4AccessControl: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const instituteId = getInstituteId();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const examType = params.examtype ?? ""; // Ensure it's a string
    const assessmentId = params.assessmentId ?? null; // Ensure it's string | null
    const { savedAssessmentId, setSavedAssessmentId } = useSavedAssessmentStore();
    const { instituteDetails } = useInstituteDetailsStore();
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId !== "defaultId" ? assessmentId : savedAssessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        }),
    );
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const form = useForm<AccessControlFormValues>({
        resolver: zodResolver(AccessControlFormSchema),
        defaultValues: {
            status: completedSteps[currentStep] ? "COMPLETE" : "INCOMPLETE",
            assessment_creation_access: [],
            live_assessment_notification: [],
            assessment_submission_and_report_access: [],
            evaluation_process: [],
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
            queryClient.invalidateQueries({ queryKey: ["GET_QUESTIONS_DATA_FOR_SECTIONS"] });
            if (assessmentId !== "defaultId") {
                useAccessControlStore.getState().reset();
                window.history.back();
                toast.success("Your assessment has been updated successfully!", {
                    className: "success-toast",
                    duration: 2000,
                });
                queryClient.invalidateQueries({ queryKey: ["GET_ASSESSMENT_DETAILS"] });
            } else {
                syncStep4DataWithStore(form);
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
                    to: "/assessment/assessment-list",
                });
            }
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
            assessmentId: assessmentId !== "defaultId" ? assessmentId : savedAssessmentId,
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
            queryClient.invalidateQueries({ queryKey: ["GET_QUESTIONS_DATA_FOR_SECTIONS"] });
            if (assessmentId !== "defaultId") {
                useAccessControlStore.getState().reset();
                window.history.back();
                toast.success("Your assessment has been updated and published successfully!", {
                    className: "success-toast",
                    duration: 2000,
                });
                queryClient.invalidateQueries({ queryKey: ["GET_ASSESSMENT_DETAILS"] });
            } else {
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
                queryClient.invalidateQueries({ queryKey: ["GET_ASSESSMENT_DETAILS"] });
                navigate({
                    to: "/assessment/assessment-list",
                });
            }
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
                assessmentId: assessmentId !== "defaultId" ? assessmentId : savedAssessmentId,
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

    useEffect(() => {
        if (assessmentId !== "defaultId") {
            form.reset({
                status: assessmentDetails[currentStep]?.status,
                assessment_creation_access: [],
                live_assessment_notification: [],
                assessment_submission_and_report_access: [],
                evaluation_process: [],
            });
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setIsAdminLoading(true);
            fetchInstituteDashboardUsers(instituteId, {
                roles: [
                    { id: "1", name: "ADMIN" },
                    { id: "2", name: "COURSE CREATOR" },
                    { id: "3", name: "ASSESSMENT CREATOR" },
                    { id: "4", name: "EVALUATOR" },
                ],
                status: [
                    { id: "1", name: "ACTIVE" },
                    { id: "2", name: "DISABLED" },
                    { id: "3", name: "INVITED" },
                ],
            })
                .then((data) => {
                    const filteredData = data.map((user: UserRolesDataEntry) => ({
                        userId: user.id,
                        email: user.email,
                        name: user.full_name,
                        roles: Array.from(
                            new Map(
                                user.roles.map((role) => [
                                    role.role_id,
                                    {
                                        roleId: role.role_id,
                                        roleName: role.role_name,
                                    },
                                ]),
                            ).values(),
                        ),
                        status: user.status,
                    }));
                    form.reset({
                        assessment_creation_access: filteredData,
                        live_assessment_notification: filteredData,
                        assessment_submission_and_report_access: filteredData,
                        evaluation_process: filteredData,
                    });
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setIsAdminLoading(false);
                });
        }, 0);

        return () => clearTimeout(timeoutId);
    }, []);

    if (isLoading) return <DashboardLoader />;

    if (isLoading || handleSubmitStep4Form.status === "pending" || isAdminLoading)
        return <DashboardLoader />;

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
                            {assessmentId !== "defaultId" ? "Update" : "Save"}
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
    const instituteId = getInstituteId();
    const getDashboardUsersData = useMutation({
        mutationFn: ({
            instituteId,
            selectedFilter,
        }: {
            instituteId: string | undefined;
            selectedFilter: RoleTypeSelectedFilter;
        }) => fetchInstituteDashboardUsers(instituteId, selectedFilter),
        onSuccess: (data) => {
            const filteredData = data.map((user: UserRolesDataEntry) => ({
                userId: user.id,
                email: user.email,
                name: user.full_name,
                roles: Array.from(
                    new Map(
                        user.roles.map((role) => [
                            role.role_id,
                            {
                                roleId: role.role_id,
                                roleName: role.role_name,
                            },
                        ]),
                    ).values(),
                ),
                status: user.status,
            }));
            form.reset({
                assessment_creation_access: filteredData,
                live_assessment_notification: filteredData,
                assessment_submission_and_report_access: filteredData,
                evaluation_process: filteredData,
            });
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const [selectedFilter, setSelectedFilter] = useState({
        roles: [],
        status: [],
    });

    const { watch, getValues } = form;
    const getKeyVal = getValues(keyVal);
    watch(keyVal);

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedFilter((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            return updatedFilters;
        });
    };

    const handleSubmitFilters = () => {
        getDashboardUsersData.mutate({
            instituteId,
            selectedFilter: {
                roles: selectedFilter.roles,
                status: [
                    { id: "1", name: "ACTIVE" },
                    { id: "2", name: "DISABLED" },
                    { id: "3", name: "INVITED" },
                ],
            },
        });
    };

    const handleResetFilters = () => {
        setSelectedFilter({
            roles: [],
            status: [],
        });
        getDashboardUsersData.mutate({
            instituteId,
            selectedFilter: {
                roles: [
                    { id: "1", name: "ADMIN" },
                    { id: "2", name: "COURSE CREATOR" },
                    { id: "3", name: "ASSESSMENT CREATOR" },
                    { id: "4", name: "EVALUATOR" },
                ],
                status: [
                    { id: "1", name: "ACTIVE" },
                    { id: "2", name: "DISABLED" },
                    { id: "3", name: "INVITED" },
                ],
            },
        });
    };

    const handleRefetchData = () => {
        getDashboardUsersData.mutate({
            instituteId,
            selectedFilter: {
                roles: [
                    { id: "1", name: "ADMIN" },
                    { id: "2", name: "COURSE CREATOR" },
                    { id: "3", name: "ASSESSMENT CREATOR" },
                    { id: "4", name: "EVALUATOR" },
                ],
                status: [
                    { id: "1", name: "ACTIVE" },
                    { id: "2", name: "DISABLED" },
                    { id: "3", name: "INVITED" },
                ],
            },
        });
    };

    const handleDisableUserMutation = useMutation({
        mutationFn: ({
            instituteId,
            status,
            userId,
        }: {
            instituteId: string | undefined;
            status: string;
            userId: string;
        }) => handleDeleteDisableDashboardUsers(instituteId, status, userId),
        onSuccess: () => {
            handleRefetchData();
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handlCancelInviteUser = (userId: string) => {
        handleDisableUserMutation.mutate({
            instituteId,
            status: "CANCEL",
            userId: userId,
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
                    <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-0 overflow-y-auto !rounded-none !p-0">
                        <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">Add User</h1>
                        <div className="flex items-center justify-between p-6 !pb-0">
                            <div className="flex items-center gap-6">
                                <ScheduleTestFilters
                                    label="Role Type"
                                    data={RoleType}
                                    selectedItems={selectedFilter["roles"] || []}
                                    onSelectionChange={(items) =>
                                        handleFilterChange("roles", items)
                                    }
                                />
                                <RoleTypeFilterButtons
                                    selectedQuestionPaperFilters={selectedFilter}
                                    handleSubmitFilters={handleSubmitFilters}
                                    handleResetFilters={handleResetFilters}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox />
                                <span className="font-thin">Select All</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 p-6">
                            {getKeyVal.map((user) => {
                                return (
                                    <div
                                        key={user.userId}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Checkbox />
                                            {user.status !== "INVITED" && <RoleTypeUserIcon />}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-4">
                                                    <p>{user.name}</p>
                                                    <div className="flex items-center gap-4">
                                                        {user.roles.map((role) => {
                                                            return (
                                                                <Badge
                                                                    key={role.roleId}
                                                                    className={`whitespace-nowrap rounded-lg border border-neutral-300 ${
                                                                        role.roleName === "ADMIN"
                                                                            ? "bg-[#F4F9FF]"
                                                                            : role.roleName ===
                                                                                "COURSE CREATOR"
                                                                              ? "bg-[#F4FFF9]"
                                                                              : role.roleName ===
                                                                                  "ASSESSMENT CREATOR"
                                                                                ? "bg-[#FFF4F5]"
                                                                                : "bg-[#F5F0FF]"
                                                                    } py-1.5 font-thin shadow-none`}
                                                                >
                                                                    {role.roleName}
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <p className="text-xs">{user.email}</p>
                                            </div>
                                        </div>
                                        {user.status === "INVITED" && (
                                            <p
                                                onClick={() => handlCancelInviteUser(user.userId)}
                                                className="cursor-pointer text-sm text-primary-500"
                                            >
                                                Cancel Invitation
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between p-6">
                            <Step4InviteUsers refetchData={handleRefetchData} />
                            <MyButton
                                type="button"
                                scale="large"
                                buttonType="primary"
                                layoutVariant="default"
                                className="mb-6"
                            >
                                Done
                            </MyButton>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Step4AccessControl;
