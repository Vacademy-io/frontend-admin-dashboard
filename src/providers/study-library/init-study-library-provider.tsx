// CallInitStudyLibraryIfNull.tsx
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useStudyLibraryQuery } from "@/services/study-library/getStudyLibraryDetails";
import { useQuery } from "@tanstack/react-query";

export const InitStudyLibraryProvider = ({ children }: { children: React.ReactNode }) => {
    // Always call the query hook, but control its execution with enabled
    const { isLoading } = useQuery({
        ...useStudyLibraryQuery(),
    });

    return <div>{isLoading ? <DashboardLoader /> : children}</div>;
};
