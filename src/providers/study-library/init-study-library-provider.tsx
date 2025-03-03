// CallInitStudyLibraryIfNull.tsx
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useStudyLibraryQuery } from "@/services/study-library/getStudyLibraryDetails";
import { useQuery } from "@tanstack/react-query";

export const InitStudyLibraryProvider = ({ children }: { children: React.ReactNode }) => {
    const { isLoading } = useQuery({
        ...useStudyLibraryQuery(),
    });

    return <div className="flex flex-1 flex-col">{isLoading ? <DashboardLoader /> : children}</div>;
};
