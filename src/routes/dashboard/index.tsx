import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useEffect } from "react";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

export const Route = createFileRoute("/dashboard/")({
    component: Dashboard,
});

export function Dashboard() {
    const { data } = useSuspenseQuery(useInstituteQuery());

    const { instituteDetails } = useInstituteDetailsStore();

    useEffect(() => {
        console.log("data: ", data);
        console.log("institute details: ", instituteDetails);
    }, []);

    return <LayoutContainer></LayoutContainer>;
}
