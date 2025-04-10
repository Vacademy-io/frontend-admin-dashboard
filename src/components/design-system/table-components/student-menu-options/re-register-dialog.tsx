// re-register-dialog.tsx
import { MyDialog } from "../../dialog";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useDialogStore } from "../../../../routes/students/students-list/-hooks/useDialogStore";
import { MyButton } from "../../button";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { SessionWithAccessDays } from "../../sessionWithAccessDays";
import { useForm, FormProvider } from "react-hook-form";
import { Plus } from "phosphor-react";
import { AddSessionDialog } from "@/routes/study-library/session/-components/session-operations/add-session/add-session-dialog";
import { AddSessionDataType } from "@/routes/study-library/session/-components/session-operations/add-session/add-session-form";
import { useAddSession } from "@/services/study-library/session-management/addSession";
import { toast } from "sonner";

interface ReRegisterDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Package {
    id: string;
    name: string;
}

export const ReRegisterDialog = ({ trigger, open, onOpenChange }: ReRegisterDialogProps) => {
    const { selectedStudent, closeAllDialogs } = useDialogStore();
    const [packageSessionId, setPackageSessionId] = useState<string | null>(null);
    const { instituteDetails } = useInstituteDetailsStore();
    const [course, setCourse] = useState<Package | undefined>();
    const [packages, setPackages] = useState<Package[]>([]);
    const form = useForm();
    const [isAddSessionDiaogOpen, setIsAddSessionDiaogOpen] = useState(false);
    const [disableAddButton, setDisableAddButton] = useState(true);
    const formSubmitRef = useRef(() => {});
    const addSessionMutation = useAddSession();

    const handleReRegister = () => {
        const selectedPackageIds = form.getValues("selectedPackages") || [];
        // TODO: Implement re-registration logic with selectedPackageIds
        console.log(selectedPackageIds);
        closeAllDialogs();
    };

    useEffect(() => {
        if (selectedStudent) {
            setPackageSessionId(selectedStudent.package_session_id);
        }
    }, [selectedStudent]);

    useEffect(() => {
        if (instituteDetails && packageSessionId) {
            const filteredBatch = instituteDetails.batches_for_sessions.find(
                (batch) => batch.id === packageSessionId,
            );

            if (filteredBatch) {
                setCourse({
                    id: filteredBatch.package_dto.id,
                    name: filteredBatch.package_dto.package_name,
                });
                const mappedPackages = instituteDetails.batches_for_sessions.filter(
                    (batch) =>
                        batch.package_dto.id === filteredBatch.package_dto.id &&
                        batch.id !== packageSessionId,
                );
                setPackages(
                    mappedPackages.map((batch) => ({
                        id: batch.id,
                        name: `${batch.level.level_name} ${batch.session.session_name}`,
                    })),
                );
            }
        }
    }, [instituteDetails, packageSessionId]);
    const handleOpenAddSessionDialog = () => {
        setIsAddSessionDiaogOpen(!isAddSessionDiaogOpen);
    };

    const dialogFooter = (
        <div className="flex w-full justify-between">
            <MyButton buttonType="secondary" onClick={() => onOpenChange(false)} type="button">
                Cancel
            </MyButton>
            <MyButton onClick={handleReRegister} type="submit">
                Re-register
            </MyButton>
        </div>
    );

    const submitFn = (fn: () => void) => {
        formSubmitRef.current = fn;
    };

    const submitButton = (
        <div className="flex items-center justify-end">
            <MyButton
                type="submit"
                buttonType="primary"
                layoutVariant="default"
                scale="large"
                className="w-[140px]"
                disable={disableAddButton}
                onClick={() => formSubmitRef.current()}
            >
                Add
            </MyButton>
        </div>
    );

    const handleAddSession = (sessionData: AddSessionDataType) => {
        const processedData = structuredClone(sessionData);

        const transformedData = {
            ...processedData,
            levels: processedData.levels.map((level) => ({
                id: level.level_dto.id,
                new_level: level.level_dto.new_level === true,
                level_name: level.level_dto.level_name,
                duration_in_days: level.level_dto.duration_in_days,
                thumbnail_file_id: level.level_dto.thumbnail_file_id,
                package_id: level.level_dto.package_id,
            })),
        };

        // Use type assertion since we know this is the correct format for the API
        addSessionMutation.mutate(
            { requestData: transformedData as unknown as AddSessionDataType },
            {
                onSuccess: () => {
                    toast.success("Session added successfully");
                    setIsAddSessionDiaogOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to add session");
                },
            },
        );
    };
    if (!selectedStudent || !instituteDetails) {
        return null;
    }

    return (
        <MyDialog
            trigger={trigger}
            heading="Re-register for Next Session"
            dialogWidth="w-[500px]"
            open={open}
            onOpenChange={onOpenChange}
            footer={dialogFooter}
        >
            <FormProvider {...form}>
                <div className="flex flex-col gap-4">
                    <h1>Course: {course?.name}</h1>
                    {packages.length > 0 && (
                        <SessionWithAccessDays
                            form={form}
                            control={form.control}
                            name="selectedPackages"
                            label="Select Packages"
                            options={packages}
                            required={true}
                        />
                    )}
                </div>
            </FormProvider>
            <AddSessionDialog
                isAddSessionDiaogOpen={isAddSessionDiaogOpen}
                handleOpenAddSessionDialog={handleOpenAddSessionDialog}
                handleSubmit={handleAddSession}
                trigger={
                    <MyButton buttonType="text" className="text-primary-500">
                        <Plus /> Add Session
                    </MyButton>
                }
                submitButton={submitButton}
                setDisableAddButton={setDisableAddButton}
                submitFn={submitFn}
            />
        </MyDialog>
    );
};
