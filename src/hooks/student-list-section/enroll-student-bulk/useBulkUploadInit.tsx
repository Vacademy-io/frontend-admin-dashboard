// // hooks/useBulkUploadInit.ts
// import { useQuery } from "@tanstack/react-query";
// import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
// import { BulkUploadResponse, BulkUploadSchema} from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
// import { INIT_CSV_BULK } from "@/constants/urls";

// interface BulkUploadInitParams {
//     instituteId: string;
//     sessionId: string;
// }

// const fetchBulkUploadInit = async ({ instituteId, sessionId }: BulkUploadInitParams) => {
//     const response = await authenticatedAxiosInstance.get<BulkUploadResponse>(INIT_CSV_BULK, {
//         params: {
//             instituteId,
//             sessionId,
//         },
//     });

//     const validatedData = BulkUploadSchema.parse(response.data);
//     return validatedData;
// };

// export const useBulkUploadInit = (
//     params: BulkUploadInitParams,
//     options?: { enabled?: boolean }
// ) => {
//     return useQuery({
//         queryKey: ["bulkUploadInit", params.instituteId, params.sessionId],
//         queryFn: () => fetchBulkUploadInit(params),
//         enabled: options?.enabled,
//     });
// };

import { useQuery } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import {
    BulkUploadResponse,
    BulkUploadSchema,
} from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { INIT_CSV_BULK } from "@/constants/urls";

interface BulkUploadInitParams {
    instituteId: string;
    sessionId: string;
}

const fetchBulkUploadInit = async ({ instituteId, sessionId }: BulkUploadInitParams) => {
    const response = await authenticatedAxiosInstance.get<BulkUploadResponse>(INIT_CSV_BULK, {
        params: {
            instituteId,
            sessionId,
        },
    });

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
