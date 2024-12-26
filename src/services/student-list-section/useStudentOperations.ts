// services/student-operations/useStudentOperations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { STUDENT_UPDATE_OPERATION, INSTITUTE_ID } from "@/constants/urls";
import { useToast } from "@/hooks/use-toast";

interface UpdateBatchRequest {
    students: {
        userId: string;
        currentPackageSessionId: string;
    }[];
    newPackageSessionId: string;
}

const updateStudentBatch = async ({ students, newPackageSessionId }: UpdateBatchRequest) => {
    const response = await authenticatedAxiosInstance.post(STUDENT_UPDATE_OPERATION, {
        operation: "UPDATE_BATCH",
        requests: students.map(({ userId, currentPackageSessionId }) => ({
            user_id: userId,
            new_state: newPackageSessionId,
            institute_id: INSTITUTE_ID,
            current_package_session_id: currentPackageSessionId,
        })),
    });
    return response.data;
};

export const useUpdateBatchMutation = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: updateStudentBatch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            toast({
                title: "Success",
                description: "Batch updated successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to update batch. Please try again.",
                variant: "destructive",
            });
            console.error("Error updating batch:", error);
        },
    });
};

interface ExtendSessionRequest {
    students: {
        userId: string;
        currentPackageSessionId: string;
    }[];
    newExpiryDate: string;
}

const extendStudentSession = async ({ students, newExpiryDate }: ExtendSessionRequest) => {
    const response = await authenticatedAxiosInstance.post(STUDENT_UPDATE_OPERATION, {
        operation: "ADD_EXPIRY",
        requests: students.map(({ userId, currentPackageSessionId }) => ({
            user_id: userId,
            new_state: newExpiryDate,
            institute_id: INSTITUTE_ID,
            current_package_session_id: currentPackageSessionId,
        })),
    });
    return response.data;
};

export const useExtendSessionMutation = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: extendStudentSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            toast({
                title: "Success",
                description: "Session extended successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to extend session. Please try again.",
                variant: "destructive",
            });
            console.error("Error extending session:", error);
        },
    });
};
