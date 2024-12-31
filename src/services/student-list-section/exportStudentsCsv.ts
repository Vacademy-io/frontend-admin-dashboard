// services/student-list-section/exportStudentsCsv.ts
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { GET_STUDENTS_CSV } from "@/constants/urls";
import { StudentFilterRequest } from "@/schemas/student/student-list/table-schema";

interface ExportParams {
    filters: StudentFilterRequest;
    pageNo?: number;
    pageSize?: number;
}

export const exportStudentsCsv = async ({ filters, pageNo = 0, pageSize = 10 }: ExportParams) => {
    try {
        const response = await authenticatedAxiosInstance({
            url: `${GET_STUDENTS_CSV}?pageNo=${pageNo}&pageSize=${pageSize}`,
            method: "POST",
            data: filters,
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
            "download",
            `students_export_${new Date().toISOString().split("T")[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();

        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error exporting CSV:", error);
        throw error;
    }
};
