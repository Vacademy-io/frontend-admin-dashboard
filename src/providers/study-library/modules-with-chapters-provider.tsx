// CallInitStudyLibraryIfNull.tsx
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useModulesWithChaptersQuery } from "@/routes/study-library/courses/-services/getModulesWithChapters";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
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
    const { getPackageSessionId } = useInstituteDetailsStore();
    const router = useRouter();
    const { courseId, levelId } = router.state.location.search;
    const { selectedSession } = useSelectedSessionStore();
    const newPackageSessionId = getPackageSessionId({
        courseId: courseId || "",
        sessionId: selectedSession?.id || "",
        levelId: levelId || "",
    });

    const myPackageSessionId = packageSessionId || newPackageSessionId;

    // Always call the query hook, but control its execution with enabled
    const { isLoading } = useQuery({
        ...useModulesWithChaptersQuery(subjectId, myPackageSessionId || ""),
    });

    return <div>{isLoading ? <DashboardLoader /> : children}</div>;
};
