import { useEffect, useState } from "react";
import SessionHeader from "./sessionHeader";
import { getSessionData } from "@/services/study-library/session-management/getSessionData";
import { SessionsResponse } from "@/types/study-library/session-types";
import { SessionCard } from "./sessionCard";

export function SessionsPage() {
    const [sessionData, setSessionData] = useState<SessionsResponse>();
    const fetch = async () => {
        const response = await getSessionData();
        setSessionData(response);
    };
    useEffect(() => {
        fetch();
    }, []);
    return (
        <div>
            <SessionHeader></SessionHeader>
            <div className="my-10 flex flex-col gap-6">
                {sessionData?.map((session, idx) => <SessionCard key={idx} data={session} />)}
            </div>
        </div>
    );
}
