import { useAddSession } from "@/services/study-library/session-management/addSession";
import { AddSessionDialog } from "./session-operations/add-session/add-session-dialog";
import { AddSessionDataType } from "./session-operations/add-session/add-session-form";
import { toast } from "sonner";
import { useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { Plus } from "@phosphor-icons/react";

export default function SessionHeader() {
    const addSessionMutation = useAddSession();
    const [isAddSessionDiaogOpen, setIsAddSessionDiaogOpen] = useState(false);
    const handleOpenAddSessionDialog = () => {
        setIsAddSessionDiaogOpen(!isAddSessionDiaogOpen);
    };

    const handleAddSession = (sessionData: AddSessionDataType) => {
        addSessionMutation.mutate(
            { requestData: sessionData },
            {
                onSuccess: () => {
                    toast.success("Session added successfully");
                    setIsAddSessionDiaogOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to add course");
                },
            },
        );
    };

    return (
        <div className="flex flex-row gap-6 text-neutral-600">
            <div className="flex flex-col gap-2">
                <div className="text-xl font-[600]">Manage Your Sessions</div>
                <div className="text-base">
                    Effortlessly organize, upload, and track educational resources in one place.
                    Provide students with easy access to the materials they need to succeed,
                    ensuring a seamless learning experience.
                </div>
            </div>
            <div>
                <AddSessionDialog
                    isAddSessionDiaogOpen={isAddSessionDiaogOpen}
                    handleOpenAddSessionDialog={handleOpenAddSessionDialog}
                    handleSubmit={handleAddSession}
                    trigger={
                        <MyButton>
                            <Plus /> Add New Session
                        </MyButton>
                    }
                />
            </div>
        </div>
    );
}
