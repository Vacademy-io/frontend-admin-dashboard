import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { SessionDropdown } from "../study-library/study-library-session-dropdown";
import { BatchSection } from "./batch-section";
import { useGetBatchesQuery } from "@/services/manage-batches/get-batches";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { SessionType } from "@/schemas/student/student-list/institute-schema";
import { CreateBatchDialog } from "./create-batch-dialog";

export const ManageBatches = () => {
    const { setNavHeading } = useNavHeadingStore();

    const { selectedSession, setSelectedSession } = useSelectedSessionStore();
    const { getAllSessions, instituteDetails } = useInstituteDetailsStore();
    const [sessionList, setSessionList] = useState(getAllSessions());
    const [currentSession, setCurrentSession] = useState<SessionType | undefined>(
        selectedSession && sessionList.includes(selectedSession) ? selectedSession : sessionList[0],
    );
    const { data, isLoading, isError } = useGetBatchesQuery({
        sessionId: currentSession?.id || "",
    });

    const handleSessionChange = (value: string | SessionType) => {
        if (typeof value !== "string" && value) {
            setCurrentSession(value);
        }
    };

    useEffect(() => {
        setSessionList(getAllSessions());
        if (currentSession && sessionList.includes(currentSession)) {
            setSelectedSession(currentSession);
        } else {
            setCurrentSession(
                selectedSession && sessionList.includes(selectedSession)
                    ? selectedSession
                    : sessionList[0],
            );
            setSelectedSession(currentSession);
        }
    }, [instituteDetails]);

    useEffect(() => {
        setNavHeading("Manage Batches");
    }, []);

    if (isLoading) return <DashboardLoader />;

    if (isError) return <p>Unable to fetch batches</p>;

    return (
        <div className="flex flex-col gap-10 text-neutral-600">
            <div className="flex items-center justify-between">
                <p className="text-h3 font-semibold">Student Batches</p>
                <div className="flex items-center gap-6">
                    <SessionDropdown
                        currentSession={currentSession ?? undefined}
                        onSessionChange={handleSessionChange}
                        className="text-title font-semibold"
                        sessionList={sessionList}
                    />
                    <CreateBatchDialog />
                </div>
            </div>
            <div className="flex flex-col gap-10">
                {data?.map((batch, index) => <BatchSection key={index} batch={batch} />)}
            </div>
        </div>
    );
};
