import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { ModulesWithChaptersProvider } from "@/providers/study-library/modules-with-chapters-provider";
import { ModuleMaterial } from "@/routes/study-library/courses/levels/subjects/modules/-components/module-material";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "phosphor-react";
import { getSubjectName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getSubjectNameById";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { getCourseSubjects } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects";

interface SubjectSearchParams {
    courseId: string;
    levelId: string;
    subjectId: string;
}

export const Route = createFileRoute("/study-library/courses/levels/subjects/modules/")({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): SubjectSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
            subjectId: search.subjectId as string,
        };
    },
});

function RouteComponent() {
    const searchParams = Route.useSearch();
    const queryClient = useQueryClient(); // Get the queryClient instance

    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();
    const { courseId, levelId, subjectId } = Route.useSearch();
    const subjectName = getSubjectName(subjectId);

    // Function to invalidate the modules with chapters query
    const invalidateModulesQuery = () => {
        queryClient.invalidateQueries({
            queryKey: ["GET_MODULES_WITH_CHAPTERS", subjectId],
        });
    };

    const handleBackClick = () => {
        navigate({
            to: "/study-library/courses/levels/subjects",
            search: { courseId, levelId },
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${subjectName} Modules`}</div>
        </div>
    );

    // Ensure dependencies are complete
    useEffect(() => {
        setNavHeading(heading);
        // You can call this function here if you want to invalidate on component mount
        invalidateModulesQuery();
    }, []);


    const { instituteDetails } = useInstituteDetailsStore();
    const batchDetails = instituteDetails?.batches_for_sessions.filter((batch)=> batch.level.id==levelId && batch.package_dto.id==courseId)
    const sessionId = batchDetails && batchDetails.length > 0 ? batchDetails[1]?.session.id : ""

    const initialSubjects = getCourseSubjects(courseId, sessionId?? "", levelId);
    const [subjects, setSubjects] = useState(initialSubjects);

    useEffect(() => {
        const newSubjects = getCourseSubjects(courseId, sessionId ?? "", levelId);
        setSubjects(newSubjects);
    }, [sessionId, levelId]);


    return (
        <LayoutContainer
            internalSideBar
            sideBarList={subjects.map((subject)=>{
                return{
                    value: subject.subject_name,
                    id: subject.id
                }
            })}
            sideBarData={{title: "Subjects", listIconText: "S", searchParam: "subjectId"}}
        >
            <InitStudyLibraryProvider>
                <ModulesWithChaptersProvider subjectId={searchParams.subjectId}>
                    <ModuleMaterial />
                </ModulesWithChaptersProvider>
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
