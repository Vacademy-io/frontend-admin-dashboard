import { useQuery } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import {
    BulkUploadResponse,
    BulkUploadSchema,
} from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { INIT_CSV_BULK } from "@/constants/urls";
import { CSVFormatConfig } from "@/types/students/bulk-upload-types";

interface BulkUploadInitParams {
    instituteId: string;
    bulkUploadInitRequest: CSVFormatConfig;
}

const fetchBulkUploadInit = async ({
    instituteId,
    bulkUploadInitRequest,
}: BulkUploadInitParams) => {
    const response = await authenticatedAxiosInstance.post<BulkUploadResponse>(
        `${INIT_CSV_BULK}?instituteId=${instituteId}`,
        bulkUploadInitRequest,
    );

    const validatedData = BulkUploadSchema.parse(response.data);
    return validatedData;
};

export const useBulkUploadInit = (
    params: BulkUploadInitParams,
    options?: { enabled?: boolean },
) => {
    return useQuery({
        queryKey: ["bulkUploadInit", params],
        queryFn: () => fetchBulkUploadInit(params),
        enabled: options?.enabled,
    });
};
