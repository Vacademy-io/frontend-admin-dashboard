// services/study-library/getModulesWithChapters.ts
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { GET_MODULES_WITH_CHAPTERS } from "@/constants/urls";
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";
import { CallInitStudyLibraryIfNull } from "@/utils/helpers/study-library-helpers.ts/api-calls-if-store-null/callInitStudyLibraryIfNull";

export const fetchModulesWithChapters = async (subjectId: string) => {
    //check the fetching of study library init api call
    CallInitStudyLibraryIfNull();

    const response = await authenticatedAxiosInstance.get(
        `${GET_MODULES_WITH_CHAPTERS}/${subjectId}`,
    );
    return response.data;
};

export const useModulesWithChaptersQuery = (subjectId: string) => {
    const setModulesData = useModulesWithChaptersStore((state) => state.setModulesWithChaptersData);

    return {
        queryKey: ["GET_MODULES_WITH_CHAPTERS", subjectId],
        queryFn: async () => {
            const data = await fetchModulesWithChapters(subjectId);
            setModulesData(data);
            return data;
        },
        staleTime: 3600000,
    };
};
