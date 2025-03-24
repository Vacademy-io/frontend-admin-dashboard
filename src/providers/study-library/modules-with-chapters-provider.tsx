// CallInitStudyLibraryIfNull.tsx
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useModulesWithChaptersQuery } from "@/routes/study-library/courses/-services/getModulesWithChapters";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { useGetPackageSessionId } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export const ModulesWithChaptersProvider = ({
    subjectId,
    children,
    packageSessionId,
}: {
    subjectId: string;
    children: React.ReactNode;
    packageSessionId?: string;
}) => {
    const GetPackageSessionId = () => {
        const router = useRouter();
        const { selectedSession } = useSelectedSessionStore();
        const { courseId, levelId } = router.state.location.search;
        return useGetPackageSessionId(courseId || "", selectedSession?.id || "", levelId || "");
    };

    let myPackageSessionId = packageSessionId;

    if (myPackageSessionId == undefined) {
        myPackageSessionId = GetPackageSessionId();
    }
    // Always call the query hook, but control its execution with enabled
    const { isLoading } = useQuery({
        ...useModulesWithChaptersQuery(subjectId, myPackageSessionId || ""),
        staleTime: 3600000,
    });

    return <div>{isLoading ? <DashboardLoader /> : children}</div>;
};
