// CallInitStudyLibraryIfNull.tsx
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useModulesWithChaptersQuery } from "@/services/study-library/getModulesWithChapters";
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";
import { useQuery } from "@tanstack/react-query";

export const ModulesWithChaptersProvider = ({
    subjectId,
    children,
}: {
    subjectId: string;
    children: React.ReactNode;
}) => {
    const { modulesWithChaptersData } = useModulesWithChaptersStore();

    // Always call the query hook, but control its execution with enabled
    const { isLoading } = useQuery({
        ...useModulesWithChaptersQuery(subjectId),
        enabled: modulesWithChaptersData === null,
        staleTime: 3600,
    });

    return <div>{isLoading ? <DashboardLoader /> : children}</div>;
};
