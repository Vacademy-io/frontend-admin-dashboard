import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { BatchSection } from "./batch-section";
import { useGetBatchesQuery } from "@/routes/students/manage-batches/-services/get-batches";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { CreateBatchDialog } from "./create-batch-dialog";
import {
    DropdownItemType,
    DropdownValueType,
} from "@/components/common/students/enroll-manually/dropdownTypesForPackageItems";
import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";

export const ManageBatches = () => {
    const { setNavHeading } = useNavHeadingStore();

    const { selectedSession, setSelectedSession } = useSelectedSessionStore();
    const { getAllSessions, instituteDetails } = useInstituteDetailsStore();
    const [sessionList, setSessionList] = useState<DropdownItemType[]>(
        getAllSessions().map((session) => ({
            id: session.id,
            name: session.session_name,
        })),
    );
    const [currentSession, setCurrentSession] = useState<DropdownItemType>(() => {
        const defaultSession = sessionList[0] || { id: "", name: "" };
        return selectedSession && sessionList.find((session) => session.id === selectedSession.id)
            ? { id: selectedSession.id, name: selectedSession.session_name }
            : defaultSession;
    });
    const { data, isLoading, isError } = useGetBatchesQuery({
        sessionId: currentSession?.id || "",
    });

    const handleSessionChange = (value: DropdownValueType) => {
        if (value && typeof value === "object" && "id" in value && "name" in value) {
            setCurrentSession(value as DropdownItemType);
            const session = getAllSessions().find(
                (session) => session.id === (value as DropdownItemType).id,
            );
            if (session) {
                setSelectedSession(session);
            }
        }
    };

    useEffect(() => {
        setSessionList(
            getAllSessions().map((session) => ({
                id: session.id,
                name: session.session_name,
            })),
        );
        if (currentSession && sessionList.includes(currentSession)) {
            const session = getAllSessions().find((session) => session.id === currentSession.id);
            if (session) {
                setSelectedSession(session);
            }
        } else {
            const defaultSession = sessionList[0] || { id: "", name: "" };
            const newSession = selectedSession
                ? { id: selectedSession.id, name: selectedSession.session_name }
                : defaultSession;
            setCurrentSession(newSession);
            const session = getAllSessions().find((session) => session.id === newSession.id);
            if (session) {
                setSelectedSession(session);
            }
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
                    <MyDropdown
                        currentValue={currentSession}
                        dropdownList={sessionList}
                        placeholder="Select Session"
                        handleChange={handleSessionChange}
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
