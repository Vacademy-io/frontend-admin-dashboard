import RootNotFoundComponent from "@/components/core/default-not-found";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

// Do not let user land on this page -> redirect to sites/list
export const Route = createFileRoute("/dashboard/")({
    beforeLoad: () => {
        throw redirect({
            to: "/dashboard/homepage",
        });
    },
    loader: () => {
        throw notFound();
    },
    component: () => {
        return <RootNotFoundComponent />;
    },
});
