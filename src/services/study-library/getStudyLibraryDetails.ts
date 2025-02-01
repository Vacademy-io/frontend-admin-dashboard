// services/study-library/getStudyLibraryDetails.ts
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { INIT_STUDY_LIBRARY, INSTITUTE_ID } from "@/constants/urls";
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";

export const fetchStudyLibraryDetails = async () => {
    const response = await authenticatedAxiosInstance.get(INIT_STUDY_LIBRARY, {
        params: {
            instituteId: INSTITUTE_ID,
        },
    });
    return response.data;
};

export const useStudyLibraryQuery = () => {
    const setStudyLibraryData = useStudyLibraryStore((state) => state.setStudyLibraryData);

    return {
        queryKey: ["GET_INIT_STUDY_LIBRARY"],
        queryFn: async () => {
            const data = await fetchStudyLibraryDetails();
            setStudyLibraryData(data);
            return data;
        },
        staleTime: 3600000,
    };
};
