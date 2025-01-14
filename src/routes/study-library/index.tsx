import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { StudyLibrary } from "@/components/common/study-library/study-library";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useEffect } from "react";

export const Route = createFileRoute("/study-library/")({
    component: StudentsList,
});

export function StudentsList() {
    const { data } = useSuspenseQuery(useInstituteQuery());

    useEffect(() => {
        console.log("data: ", data);
    }, []);

    return (
        <LayoutContainer>
            <StudyLibrary />
        </LayoutContainer>
    );
}
