import { useStudyLibraryQuery } from "@/services/study-library/getStudyLibraryDetails";
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";
import { useSuspenseQuery } from "@tanstack/react-query";

export const CallInitStudyLibraryIfNull = () => {
    const { studyLibraryData } = useStudyLibraryStore();
    // Call hooks unconditionally at the top level
    const { data } = useSuspenseQuery(useStudyLibraryQuery());

    // You can use the effect of the query only when needed
    if (studyLibraryData === null && data) {
        // Handle the data update here if needed
        return null;
    }

    return null; // Or whatever you want to render
};
