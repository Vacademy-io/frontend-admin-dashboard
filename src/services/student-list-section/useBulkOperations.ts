// services/student-operations/useBulkOperations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { STUDENT_UPDATE_OPERATION, INSTITUTE_ID } from "@/constants/urls";
import { useToast } from "@/hooks/use-toast";
// import { StudentTable } from "@/schemas/student/student-list/table-schema";

interface BulkUpdateBatchRequest {
    students: {
        userId: string;
        currentPackageSessionId: string;
    }[];
    newPackageSessionId: string;
}

const bulkUpdateStudentBatch = async ({
    students,
    newPackageSessionId,
}: BulkUpdateBatchRequest) => {
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

export const useBulkUpdateBatchMutation = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: bulkUpdateStudentBatch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            toast({
                title: "Success",
                description: "Successfully updated batches for selected students",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to update batches. Please try again.",
                variant: "destructive",
            });
            console.error("Error in bulk batch update:", error);
        },
    });
};

interface BulkExtendSessionRequest {
    students: {
        userId: string;
        currentPackageSessionId: string;
    }[];
    newExpiryDate: string;
}

const bulkExtendStudentSession = async ({ students, newExpiryDate }: BulkExtendSessionRequest) => {
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

export const useBulkExtendSessionMutation = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: bulkExtendStudentSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            toast({
                title: "Success",
                description: "Successfully extended sessions for selected students",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to extend sessions. Please try again.",
                variant: "destructive",
            });
            console.error("Error in bulk session extension:", error);
        },
    });
};
