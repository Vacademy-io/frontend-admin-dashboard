import { useEffect, useState } from "react";
import SessionHeader from "./sessionHeader";
import { useSessionData } from "@/services/study-library/session-management/getSessionData";
import { SessionsResponse } from "@/types/study-library/session-types";
import { SessionCard } from "./sessionCard";
import { useQuery } from "@tanstack/react-query";
import { DashboardLoader } from "@/components/core/dashboard-loader";

export function SessionsPage() {
    const { data, isLoading } = useQuery({
        ...useSessionData(),
    });
    const [sessionData, setSessionData] = useState<SessionsResponse>();

    useEffect(() => {
        setSessionData(data);
    }, [data]);

    if (isLoading) {
        return <DashboardLoader />;
    }
    return (
        <div>
            <SessionHeader></SessionHeader>
            <div className="my-10 flex flex-col gap-6 text-neutral-600">
                {sessionData?.map((session, idx) => <SessionCard key={idx} data={session} />)}
            </div>
        </div>
    );
}
