// hooks/student-list/useInstituteDetails.ts
import { useQuery } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { InstituteDetailsType } from "@/schemas/student-list/institute-schema";
import { useInstituteDetailsStore } from "@/stores/student-list/useInstituteDetailsStore";
import { INIT_INSTITUTE } from "@/constants/urls";

const INSTITUTE_ID = "c70f40a5-e4d3-4b6c-a498-e612d0d4b133";

const fetchInstituteDetails = async (): Promise<InstituteDetailsType> => {
    const response = await authenticatedAxiosInstance.get<InstituteDetailsType>(INIT_INSTITUTE, {
        headers: {
            clientId: INSTITUTE_ID,
        },
    });
    return response.data;
};

export const useInstituteQuery = () => {
    const setInstituteDetails = useInstituteDetailsStore((state) => state.setInstituteDetails);

    return useQuery({
        queryKey: ["institute"],
        queryFn: async () => {
            const data = await fetchInstituteDetails();
            setInstituteDetails(data);
            return data;
        },
    });
};
