import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { InstituteDetailsType } from "@/schemas/student-list/institute-schema";
import { useInstituteDetailsStore } from "@/stores/student-list/useInstituteDetailsStore";
import { INIT_INSTITUTE } from "@/constants/urls";
import { INSTITUTE_ID } from "@/constants/urls";

export const fetchInstituteDetails = async (): Promise<InstituteDetailsType> => {
    const response = await authenticatedAxiosInstance.get<InstituteDetailsType>(INIT_INSTITUTE, {
        headers: {
            clientId: INSTITUTE_ID,
        },
    });
    return response.data;
};

export const useInstituteQuery = () => {
    const setInstituteDetails = useInstituteDetailsStore((state) => state.setInstituteDetails);

    return {
        queryKey: ["GET_INIT_INSTITUTE"],
        queryFn: async () => {
            const data = await fetchInstituteDetails();
            setInstituteDetails(data);
            return data;
        },
    };
};
