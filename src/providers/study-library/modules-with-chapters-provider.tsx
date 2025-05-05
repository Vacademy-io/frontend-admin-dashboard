// CallInitStudyLibraryIfNull.tsx
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useModulesWithChaptersQuery } from "@/routes/study-library/courses/-services/getModulesWithChapters";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const ModulesWithChaptersProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { getPackageSessionId } = useInstituteDetailsStore();
    const router = useRouter();
    const { courseId, levelId, subjectId, sessionId } = router.state.location.search;
    const newPackageSessionId = getPackageSessionId({
        courseId: courseId || "",
        sessionId: sessionId || "",
        levelId: levelId || "",
    });

    const myPackageSessionId = newPackageSessionId;

    useEffect(()=>{
        console.log(subjectId);
    }, [subjectId])

    // Always call the query hook, but control its execution with enabled
    const { isLoading } = useQuery({
        ...useModulesWithChaptersQuery(subjectId || "", myPackageSessionId || ""),
    });


    return <div>{isLoading ? <DashboardLoader /> : children}</div>;
};
