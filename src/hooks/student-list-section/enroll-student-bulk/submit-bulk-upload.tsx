// hooks/student-list-section/enroll-student-bulk/submitBulkUpload.ts
import bulkUploadAxiosInstance from "@/services/student-list-section/bulk-upload/bulk-upload-axios-instance";
import { SchemaFields } from "@/types/students/bulk-upload-types";
import Papa from "papaparse";
import { toast } from "sonner";
import { STUDENT_CSV_UPLOAD_URL } from "@/constants/urls";
import axios from "axios";

interface SubmitBulkUploadParams {
    data: SchemaFields[];
    instituteId: string;
}

export const submitBulkUpload = async ({ data, instituteId }: SubmitBulkUploadParams) => {
    try {
        // Create form data
        const formData = new FormData();

        // Convert data to CSV and append as file
        const csvContent = Papa.unparse(data);
        const csvFile = new File([csvContent], "students.csv", { type: "text/csv" });
        formData.append("file", csvFile);

        // Make API call with the correct URL structure
        const response = await bulkUploadAxiosInstance({
            method: "POST",
            url: `${STUDENT_CSV_UPLOAD_URL}?instituteId=${instituteId}`,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Upload error details:", {
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
            });
            toast.error(error.response?.data?.message || "Failed to upload students");
        } else {
            toast.error("An unexpected error occurred");
        }
        throw error;
    }
};
