import { useQuery } from "@tanstack/react-query";
import { FilterRequestType } from "../-types/enroll-request-types";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ENROLL_REQUESTS } from "@/constants/urls";
import { LearnerInvitationPagination } from "../-types/enroll-response-type";

interface EnrollRequestParamType {
    instituteId: string;
    pageNo: number;
    pageSize: number;
    filterRequest: FilterRequestType;
}

export const useGetEnrollRequests = ({
    instituteId,
    pageNo,
    pageSize,
    filterRequest,
}: EnrollRequestParamType) => {
    return useQuery<LearnerInvitationPagination | null>({
        queryKey: ["enrollRequestList", instituteId, pageNo, pageSize, filterRequest],
        queryFn: async () => {
            const response = await authenticatedAxiosInstance.post(
                `${ENROLL_REQUESTS}?instituteId=${instituteId}&pageNo=${pageNo}&pageSize=${pageSize}`,
                filterRequest,
            );
            return response.data;
        },
    });
};
