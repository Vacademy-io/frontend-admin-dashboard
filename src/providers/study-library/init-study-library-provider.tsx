// CallInitStudyLibraryIfNull.tsx
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useStudyLibraryQuery } from "@/services/study-library/getStudyLibraryDetails";
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";
import { useQuery } from "@tanstack/react-query";

export const InitStudyLibraryProvider = ({ children }: { children: React.ReactNode }) => {
    const { studyLibraryData } = useStudyLibraryStore();

    // Always call the query hook, but control its execution with enabled
    const { isLoading } = useQuery({
        ...useStudyLibraryQuery(),
        enabled: studyLibraryData === null,
        staleTime: 3600,
    });

    return <div>{isLoading ? <DashboardLoader /> : children}</div>;
};
