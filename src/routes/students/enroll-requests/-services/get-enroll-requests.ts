import { useQuery } from "@tanstack/react-query";
import { FilterRequestType } from "../-types/enroll-request-types";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ENROLL_REQUESTS } from "@/constants/urls";

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
    return useQuery({
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
